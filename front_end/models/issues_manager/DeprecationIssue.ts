// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import * as i18n from '../../core/i18n/i18n.js';
import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';

import {Issue, IssueCategory, IssueKind} from './Issue.js';

import {resolveLazyDescription, type MarkdownIssueDescription} from './MarkdownIssueDescription.js';

// clang-format off
const UIStrings = {
  // Store strings used across messages in this block.
  /**
   * @description This links to the chrome feature status page when one exists.
   */
  feature: 'Check the feature status page for more details.',
  /**
   * @description This links to the chromium dash schedule when a milestone is set.
   * @example {100} milestone
   */
   milestone: 'This change will go into effect with milestone {milestone}.',
  /**
   * @description Title of issue raised when a deprecated feature is used
   */
  title: 'Deprecated Feature Used',

  /**
   * @description We show this warning when 1) an "authorization" header is
   *   attached to the request by scripts, 2) there is no "authorization" in
   *   the "access-control-allow-headers" header in the response, and 3) there
   *   is a wildcard symbol ("*") in the "access-control-allow-header" header
   *   in the response. This is allowed now, but we're planning to reject such
   *   responses and require responses to have an "access-control-allow-headers"
   *   containing "authorization".
   */
  authorizationCoveredByWildcard:
      'Authorization will not be covered by the wildcard symbol (*) in CORS `Access-Control-Allow-Headers` handling.',
  /**
   * @description This warning occurs when a page attempts to request a resource
   *    whose URL contained both a newline character (`\n` or `\r`), and a
   *    less-than character (`<`). These resources are blocked.
   */
  canRequestURLHTTPContainingNewline:
      'Resource requests whose URLs contained both removed whitespace `\\(n|r|t)` characters and less-than characters (`<`) are blocked. Please remove newlines and encode less-than characters from places like element attribute values in order to load these resources.',
  /**
   * @description This warning occurs when the website attempts to invoke the
   *    deprecated `chrome.loadTimes().connectionInfo` API.
   */
  chromeLoadTimesConnectionInfo:
      '`chrome.loadTimes()` is deprecated, instead use standardized API: Navigation Timing 2.',
  /**
   * @description This warning occurs when the website attempts to invoke the
   *    deprecated `chrome.loadTimes().firstPaintAfterLoadTime` API.
   */
  chromeLoadTimesFirstPaintAfterLoadTime:
      '`chrome.loadTimes()` is deprecated, instead use standardized API: Paint Timing.',
  /**
   * @description This warning occurs when the website attempts to invoke the
   *    deprecated `chrome.loadTimes().wasAlternateProtocolAvailable` API.
   */
  chromeLoadTimesWasAlternateProtocolAvailable:
      '`chrome.loadTimes()` is deprecated, instead use standardized API: `nextHopProtocol` in Navigation Timing 2.',
  /**
   * @description This warning occurs when the browser attempts to store a
   *    cookie containing a banned character. Rather than the cookie string
   *    being truncated at the banned character, the entire cookie will be
   *    rejected now.
   */
  cookieWithTruncatingChar: 'Cookies containing a `\\(0|r|n)` character will be rejected instead of truncated.',
  /**
   * @description This warning occurs when a frame accesses another frame's
   *    data after having set `document.domain` without having set the
   *    `Origin-Agent-Cluster` http header. This is a companion warning to
   *    `documentDomainSettingWithoutOriginAgentClusterHeader`, where that
   *    warning occurs when `document.domain` is set, and this warning
   *    occurs when an access has been made, based on that previous
   *    `document.domain` setting.
   */
  crossOriginAccessBasedOnDocumentDomain:
      'Relaxing the same-origin policy by setting `document.domain` is deprecated, and will be disabled by default. This deprecation warning is for a cross-origin access that was enabled by setting `document.domain`.',
  /**
   * @description Issue text shown when the web page uses a deprecated web API. The placeholder is
   * the deprecated web API function.
   * @example {window.alert} PH1
   */
  crossOriginWindowApi: 'Triggering {PH1} from cross origin iframes has been deprecated and will be removed in the future.',
  /**
   * @description Warning displayed to developers when they hide the Cast button
   * on a video element using the deprecated CSS selector instead of using the
   * disableRemotePlayback attribute on the element.
   */
  cssSelectorInternalMediaControlsOverlayCastButton:
      'The `disableRemotePlayback` attribute should be used in order to disable the default Cast integration instead of using `-internal-media-controls-overlay-cast-button` selector.',
  /**
   * @description This message is shown when the example deprecated feature is used
   */
  deprecationExample: 'This is an example of a translated deprecation issue message.',
  /**
   * @description This warning occurs when a script modifies `document.domain`
   *    without having set on `Origin-Agent-Cluster` http header. In other
   *    words, when a script relies on the default behaviour of
   *    `Origin-Agent-Cluster` when setting document.domain.
   */
  documentDomainSettingWithoutOriginAgentClusterHeader:
      'Relaxing the same-origin policy by setting `document.domain` is deprecated, and will be disabled by default. To continue using this feature, please opt-out of origin-keyed agent clusters by sending an `Origin-Agent-Cluster: ?0` header along with the HTTP response for the document and frames. See https://developer.chrome.com/blog/immutable-document-domain/ for more details.',
  /**
   * @description Warning displayed to developers when the non-standard `Event.path` API is used to notify them that this API is deprecated.
   */
  eventPath: '`Event.path` is deprecated and will be removed. Please use `Event.composedPath()` instead.',
  /**
   * @description This message is shown when the deprecated Expect-CT header is present.
   */
  expectCTHeader: 'The `Expect-CT` header is deprecated and will be removed. Chrome requires Certificate Transparency for all publicly trusted certificates issued after April 30, 2018.',
  /**
   * @description Warning displayed to developers when the Geolocation API is used from an insecure origin (one that isn't localhost or doesn't use HTTPS) to notify them that this use is no longer supported.
   */
  geolocationInsecureOrigin:
      '`getCurrentPosition()` and `watchPosition()` no longer work on insecure origins. To use this feature, you should consider switching your application to a secure origin, such as HTTPS. See https://goo.gle/chrome-insecure-origins for more details.',
  /**
   * @description Warning displayed to developers when the Geolocation API is used from an insecure origin (one that isn't localhost or doesn't use HTTPS) to notify them that this use is deprecated.
   */
  geolocationInsecureOriginDeprecatedNotRemoved:
      '`getCurrentPosition()` and `watchPosition()` are deprecated on insecure origins. To use this feature, you should consider switching your application to a secure origin, such as HTTPS. See https://goo.gle/chrome-insecure-origins for more details.',
  /**
   * @description This warning occurs when the `getUserMedia()` API is invoked
   *    on an insecure (e.g., HTTP) site. This is only permitted on secure sites
   *    (e.g., HTTPS).
   */
  getUserMediaInsecureOrigin:
      '`getUserMedia()` no longer works on insecure origins. To use this feature, you should consider switching your application to a secure origin, such as HTTPS. See https://goo.gle/chrome-insecure-origins for more details.',
  /**
   * @description A deprecation warning shown to developers in the DevTools Issues tab when code tries to use the deprecated hostCandidate field, guiding developers to use the the equivalent information in the .address and .port fields instead.
   */
  hostCandidateAttributeGetter:
      '`RTCPeerConnectionIceErrorEvent.hostCandidate` is deprecated. Please use `RTCPeerConnectionIceErrorEvent.address` or `RTCPeerConnectionIceErrorEvent.port` instead.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab,
   * when a service worker reads one of the fields from an event named
   * "canmakepayment".
   */
  identityInCanMakePaymentEvent: 'The merchant origin and arbitrary data from the `canmakepayment` service worker event are deprecated and will be removed: `topOrigin`, `paymentRequestOrigin`, `methodData`, `modifiers`.',
  /**
   * @description This warning occurs when an insecure context (e.g., HTTP)
   *    requests a private resource (not on open internet). This is done to
   *    mitigate the potential for CSRF and other attacks.
   */
  insecurePrivateNetworkSubresourceRequest:
      'The website requested a subresource from a network that it could only access because of its users\' privileged network position. These requests expose non-public devices and servers to the internet, increasing the risk of a cross-site request forgery (CSRF) attack, and/or information leakage. To mitigate these risks, Chrome deprecates requests to non-public subresources when initiated from non-secure contexts, and will start blocking them.',
  /**
   * @description This warning occurs when a stylesheet loaded from a local
   *    file directive does not end in the file type `.css`.
   */
  localCSSFileExtensionRejected:
      'CSS cannot be loaded from `file:` URLs unless they end in a `.css` file extension.',
  /**
   * @description This is a deprecation warning to developers that occurs when
   * the script attempts to use the Media Source Extensions API in a way that
   * is no longer supported by the specification for the API. The usage
   * that is problematic is when the script calls the `SourceBuffer.abort()`
   * method at a time when there is still processing happening in response to a
   * previous `SourceBuffer.remove()` call for the same SourceBuffer object.
   * More precisely, we show this warning to developers when script calls the
   * SourceBuffer abort() method while the asynchronous processing of a remove()
   * call on that SourceBuffer is not yet complete. Early versions of the Media
   * Source Extensions specification allowed such aborts, but standardization of
   * the specification resulted in disallowing the aborts. The script should
   * instead wait for the asynchronous remove() operation to complete, which is
   * observable by listening for the associated 'updateend' event from the
   * SourceBuffer. A note is also included in the warning, describing when
   * abort() is meaningful and allowed by the specification for purposes other
   * than interrupting a remove() operation's asynchronous steps. Those
   * supported purposes include using abort() to interrupt processing that may
   * still be happening in response to a previous appendBuffer() call on that
   * SourceBuffer, or using abort() to clear the internal of any unprocessed
   * data remaining from previous appendBuffer() calls.
   * See https://www.w3.org/TR/media-source-2/#dom-sourcebuffer-abort for the
   * currently specified behavior, which would throw an exception once the
   * deprecated removal abort is no longer supported.
   * See https://github.com/w3c/media-source/issues/19 for the discussion that
   * led to the specification change.
   */
  mediaSourceAbortRemove:
      'Using `SourceBuffer.abort()` to abort `remove()`\'s asynchronous range removal is deprecated due to specification change. Support will be removed in the future. You should listen to the `updateend` event instead. `abort()` is intended to only abort an asynchronous media append or reset parser state.',
  /**
   * @description This is a deprecation warning to developers that occurs when
   * the script attempts to use the Media Source Extensions API in a way that is
   * no longer supported by the specification for the API. The usage that is
   * problematic is when the script sets the duration attribute of a MediaSource
   * object too low. The duration attribute of a MediaSource must be longer than
   * the actual duration of any media (audio or video) already in the
   * MediaSource. When set too low, the MediaSource must remove audio and video
   * content that is beyond the time indicated by the new duration. Content
   * removal that is caused by setting the duration attribute too low is no
   * longer allowed by the specification. The message describes the minimum
   * allowable duration value as the "highest presentation timestamp of any
   * buffered coded frames" as a more precise way of describing the duration of
   * content already in the MediaSource: "coded frames" are the specification's
   * way of describing compressed audio frames or compressed video frames, and
   * they each have a "presentation timestamp" that describes precisely when
   * that frame's playback occurs in the overall media presentation. Early
   * versions of the Media Source Extensions specification allowed this to
   * happen, but standardization of the specification resulted in disallowing
   * this behavior. The underlying issue leading to this specification change
   * was that setting the duration attribute should be synchronous, but setting
   * it lower than the timestamp of something currently buffered would cause
   * confusing removal of media between that new duration and the previous,
   * larger, duration. The script should instead explicitly remove that range of
   * media first, before lowering the duration.
   * See https://www.w3.org/TR/media-source-2/#dom-mediasource-duration and
   * https://www.w3.org/TR/media-source-2/#dom-mediasource-duration for the
   * currently specified behavior, which would throw an exception once support
   * is removed for deprecated implicit asynchronous range removal when duration
   * is truncated.
   * See both https://github.com/w3c/media-source/issues/20 and
   * https://github.com/w3c/media-source/issues/26 for the discussion that led
   * to the specification change.
   */
  mediaSourceDurationTruncatingBuffered:
      'Setting `MediaSource.duration` below the highest presentation timestamp of any buffered coded frames is deprecated due to specification change. Support for implicit removal of truncated buffered media will be removed in the future. You should instead perform explicit `remove(newDuration, oldDuration)` on all `sourceBuffers`, where `newDuration < oldDuration`.',
  /**
   * @description This warning occurs when the browser requests Web MIDI access
   *    as sysex (system exclusive messages) can be allowed via prompt even if
   *    the browser did not specifically request it.
   */
  noSysexWebMIDIWithoutPermission:
      'Web MIDI will ask a permission to use even if the sysex is not specified in the `MIDIOptions`.',
  /**
   * @description Warning displayed to developers when the Notification API is used from an insecure origin (one that isn't localhost or doesn't use HTTPS) to notify them that this use is no longer supported.
   */
  notificationInsecureOrigin:
      'The Notification API may no longer be used from insecure origins. You should consider switching your application to a secure origin, such as HTTPS. See https://goo.gle/chrome-insecure-origins for more details.',
  /**
   * @description Warning displayed to developers when permission to use notifications has been requested by a cross-origin iframe, to notify them that this use is no longer supported.
   */
  notificationPermissionRequestedIframe:
      'Permission for the Notification API may no longer be requested from a cross-origin iframe. You should consider requesting permission from a top-level frame or opening a new window instead.',
  /**
   * @description Warning displayed to developers when CreateImageBitmap is used with the newly deprecated option imageOrientation: 'none'.
   */
   obsoleteCreateImageBitmAPImageOrientationNone:
       'Option `imageOrientation: "none"` in createImageBitmap is deprecated. Please use createImageBitmap with option {imageOrientation: "from-image"} instead.',
  /**
   * @description This warning occurs when the WebRTC protocol attempts to
   *    negotiate a connection using an obsolete cipher and risks connection
   *    security.
   */
  obsoleteWebRtcCipherSuite:
      'Your partner is negotiating an obsolete (D)TLS version. Please check with your partner to have this fixed.',
  /**
   * @description Warning displayed to developers when `window.openDatabase` is used in non-secure contexts to notify that the API is deprecated and will be removed.
   */
  openWebDatabaseInsecureContext:
      'WebSQL in non-secure contexts is deprecated and will be removed soon. Please use Web Storage or Indexed Database.',
  /**
   * @description Warning displayed to developers when they use the PaymentInstruments API to let them know this API is deprecated.
   */
  paymentInstruments: '`paymentManager.instruments` is deprecated. Please use just-in-time install for payment handlers instead.',
  /**
   * @description Warning displayed to developers when their Web Payment API usage violates their Content-Security-Policy (CSP) connect-src directive to let them know this CSP bypass has been deprecated.
   */
  paymentRequestCSPViolation: 'Your `PaymentRequest` call bypassed Content-Security-Policy (CSP) `connect-src` directive. This bypass is deprecated. Please add the payment method identifier from the `PaymentRequest` API (in `supportedMethods` field) to your CSP `connect-src` directive.',
  /**
   * @description Warning displayed to developers when persistent storage type is used to notify that storage type is deprecated.
   */
  persistentQuotaType:
      '`StorageType.persistent` is deprecated. Please use standardized `navigator.storage` instead.',
  /**
   * @description This issue indicates that a `<source>` element with a `<picture>` parent was using an `src` attribute, which is not valid and is ignored by the browser. The `srcset` attribute should be used instead.
   */
  pictureSourceSrc:
      '`<source src>` with a `<picture>` parent is invalid and therefore ignored. Please use `<source srcset>` instead.',
  /**
   * @description Warning displayed to developers when the vendor-prefixed method is used rather than the equivalent unprefixed method.
   * Both placeholders are Web API functions (single words).
   * @example {webkitCancelAnimationFrame} PH1
   * @example {cancelAnimationFrame} PH2
   */
  vendorSpecificApi: '{PH1} is vendor-specific. Please use the standard {PH2} instead.',
  /**
   * @description Warning displayed to developers when `window.webkitStorageInfo` is used to notify that the API is deprecated.
   */
  prefixedStorageInfo:
      '`window.webkitStorageInfo` is deprecated. Please use standardized `navigator.storage` instead.',
  /**
   * @description Standard message when one web API is deprecated in favor of another. Both
   * placeholders are always web API functions.
   * @example {HTMLVideoElement.webkitDisplayingFullscreen} PH1
   * @example {Document.fullscreenElement} PH2
   */
  deprecatedWithReplacement: '{PH1} is deprecated. Please use {PH2} instead.',
  /**
   * @description This warning occurs when a subresource loaded by a page
   *    has a URL with an authority portion. These are disallowed.
   */
  requestedSubresourceWithEmbeddedCredentials:
      'Subresource requests whose URLs contain embedded credentials (e.g. `https://user:pass@host/`) are blocked.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab.
   * It's shown when a video conferencing website attempts to use a
   * non-standard crypto method when performing a handshake to set up a
   * connection with another endpoint.
   */
  rtcConstraintEnableDtlsSrtpFalse:
      'The constraint `DtlsSrtpKeyAgreement` is removed. You have specified a `false` value for this constraint, which is interpreted as an attempt to use the removed `SDES key negotiation` method. This functionality is removed; use a service that supports `DTLS key negotiation` instead.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab.
   * It's shown when a video conferencing website uses a non-standard
   * API for controlling the crypto method used, but is not having an
   * effect because the desired behavior is already enabled-by-default.
   */
  rtcConstraintEnableDtlsSrtpTrue:
      'The constraint `DtlsSrtpKeyAgreement` is removed. You have specified a `true` value for this constraint, which had no effect, but you can remove this constraint for tidiness.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab.
   * The `Session Description Protocol`, or `SDP` for short, is a
   * protocol used by video conferencing websites to establish the
   * number of audio and/or video streams to send and/or receive. This
   * warning is emitted when a web site attempts to use a deprecated
   * version of the protocol, called `Plan B`, that is no longer
   * supported. The spec compliant version of the protocol is called
   * `Unified Plan`.
   */
  rtcPeerConnectionComplexPlanBSdpUsingDefaultSdpSemantics:
      '`Complex Plan B SDP` detected. This dialect of the `Session Description Protocol` is no longer supported. Please use `Unified Plan SDP` instead.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab.
   * The `Session Description Protocol`, or `SDP` for short, is a
   * protocol used by video conferencing websites to establish the
   * number of audio and/or video streams to send and/or receive. This
   * warning is emitted when a web site attempts to use a deprecated
   * version of the protocol, called `Plan B`, that is no longer
   * supported. The spec compliant version of the protocol is called
   * `Unified Plan`.
   */
  rtcPeerConnectionSdpSemanticsPlanB:
      '`Plan B SDP semantics`, which is used when constructing an `RTCPeerConnection` with `{sdpSemantics:\'plan-b\'}`, is a legacy non-standard version of the `Session Description Protocol` that has been permanently deleted from the Web Platform. It is still available when building with `IS_FUCHSIA`, but we intend to delete it as soon as possible. Stop depending on it. See https://crbug.com/1302249 for status.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab.
   * It's shown then a video conferencing website attempts to use the
   * `RTCP MUX` policy.
   */
  rtcpMuxPolicyNegotiate: 'The `rtcpMuxPolicy` option is deprecated and will be removed.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab. The placeholder is always the noun
   * "SharedArrayBuffer" which refers to a JavaScript construct.
   */
  sharedArrayBufferConstructedWithoutIsolation:
      '`SharedArrayBuffer` will require cross-origin isolation. See https://developer.chrome.com/blog/enabling-shared-array-buffer/ for more details.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab.
   * It's shown when the speech synthesis API is called before the page
   * receives a user activation.
   */
  textToSpeech_DisallowedByAutoplay:
      '`speechSynthesis.speak()` without user activation is deprecated and will be removed.',
  /**
   * @description A deprecation warning shown in the DevTools Issues tab. The placeholder is always the noun
   * "SharedArrayBuffer" which refers to a JavaScript construct. "Extensions" refers to Chrome extensions. The warning is shown
   * when Chrome Extensions attempt to use "SharedArrayBuffer"s under insecure circumstances.
   */
  v8SharedArrayBufferConstructedInExtensionWithoutIsolation:
      'Extensions should opt into cross-origin isolation to continue using `SharedArrayBuffer`. See https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/.',
  /**
   * @description Warning displayed to developers that they are using
   * `XMLHttpRequest` API in a way that they expect an unsupported character
   * encoding `UTF-16` could be used in the server reply.
   */
  xhrJSONEncodingDetection: 'UTF-16 is not supported by response json in `XMLHttpRequest`',
  /**
   * @description Warning displayed to developers. It is shown when
   * the `XMLHttpRequest` API is used in a way that it slows down the page load
   * of the next page. The `main thread` refers to an operating systems thread
   * used to run most of the processing of HTML documents, so please use a
   * consistent wording.
   */
  xmlHttpRequestSynchronousInNonWorkerOutsideBeforeUnload:
      'Synchronous `XMLHttpRequest` on the main thread is deprecated because of its detrimental effects to the end user\u2019s experience. For more help, check https://xhr.spec.whatwg.org/.',
  /**
   * @description Warning displayed to developers that instead of using
   *    `supportsSession()`, which returns a promise that resolves if
   *    the XR session can be supported and rejects if not, they should
   *    use `isSessionSupported()` which will return a promise which
   *    resolves to a boolean indicating if the XR session can be
   *    supported or not, but may reject to throw an exception.
   */
  xrSupportsSession:
      '`supportsSession()` is deprecated. Please use `isSessionSupported()` and check the resolved boolean value instead.',
  /**
   * @description Warning displayed to developers that use overflow:visible
   * for replaced elements. This declaration was earlier ignored but will now
   * change the element's painting based on whether the overflow value allows
   * the element to paint outside its bounds.
   */
  overflowVisibleOnReplacedElement:
      'Specifying `overflow: visible` on img, video and canvas tags may cause them to produce visual content outside of the element bounds. See https://github.com/WICG/shared-element-transitions/blob/main/debugging_overflow_on_images.md.',
  /**
   * @description Warning displayed to developers that the API
   * `chrome.privacy.websites.privacySandboxEnabled` is being deprecated in
   * favour of three new more granular APIs: topicsEnabled, FledgeEnabled and
   * adMeasurementEnabled. The `privacySandboxEnabled` API allowed extensions to
   * control the homologous Chrome Setting. The existing Chrome Setting for
   * Privacy Sandbox is also going away in favor of more granular settings that
   * are matched by the new extensions APIs- topicsEnabled, FledgeEnabled and
   * adMeasurementEnabled.
   */
  privacySandboxExtensionsAPI:
      'We’re deprecating the API `chrome.privacy.websites.privacySandboxEnabled`, though it will remain active for backward compatibility until release M113. Instead, please use `chrome.privacy.websites.topicsEnabled`, `chrome.privacy.websites.fledgeEnabled` and `chrome.privacy.websites.adMeasurementEnabled`. See https://developer.chrome.com/docs/extensions/reference/privacy/#property-websites-privacySandboxEnabled.',
};
// clang-format on
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/DeprecationIssue.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);

export class DeprecationIssue extends Issue {
  #issueDetails: Protocol.Audits.DeprecationIssueDetails;

  constructor(issueDetails: Protocol.Audits.DeprecationIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel) {
    const issueCode = [
      Protocol.Audits.InspectorIssueCode.DeprecationIssue,
      issueDetails.type,
    ].join('::');
    super({code: issueCode, umaCode: 'DeprecationIssue'}, issuesModel);
    this.#issueDetails = issueDetails;
  }

  getCategory(): IssueCategory {
    return IssueCategory.Other;
  }

  details(): Protocol.Audits.DeprecationIssueDetails {
    return this.#issueDetails;
  }

  getDescription(): MarkdownIssueDescription {
    let messageFunction = (): string => '';
    let feature = 0;
    let milestone = 0;
    // Keep case statements alphabetized per DeprecationIssueType.
    switch (this.#issueDetails.type) {
      case Protocol.Audits.DeprecationIssueType.AuthorizationCoveredByWildcard:
        messageFunction = i18nLazyString(UIStrings.authorizationCoveredByWildcard);
        milestone = 97;
        break;
      case Protocol.Audits.DeprecationIssueType.CanRequestURLHTTPContainingNewline:
        messageFunction = i18nLazyString(UIStrings.canRequestURLHTTPContainingNewline);
        feature = 5735596811091968;
        break;
      case Protocol.Audits.DeprecationIssueType.ChromeLoadTimesConnectionInfo:
        messageFunction = i18nLazyString(UIStrings.chromeLoadTimesConnectionInfo);
        feature = 5637885046816768;
        break;
      case Protocol.Audits.DeprecationIssueType.ChromeLoadTimesFirstPaintAfterLoadTime:
        messageFunction = i18nLazyString(UIStrings.chromeLoadTimesFirstPaintAfterLoadTime);
        feature = 5637885046816768;
        break;
      case Protocol.Audits.DeprecationIssueType.ChromeLoadTimesWasAlternateProtocolAvailable:
        messageFunction = i18nLazyString(UIStrings.chromeLoadTimesWasAlternateProtocolAvailable);
        feature = 5637885046816768;
        break;
      case Protocol.Audits.DeprecationIssueType.CookieWithTruncatingChar:
        messageFunction = i18nLazyString(UIStrings.cookieWithTruncatingChar);
        milestone = 103;
        break;
      case Protocol.Audits.DeprecationIssueType.CrossOriginAccessBasedOnDocumentDomain:
        messageFunction = i18nLazyString(UIStrings.crossOriginAccessBasedOnDocumentDomain);
        milestone = 109;
        break;
      case Protocol.Audits.DeprecationIssueType.CrossOriginWindowAlert:
        messageFunction = i18nLazyString(UIStrings.crossOriginWindowApi, {PH1: 'window.alert'});
        break;
      case Protocol.Audits.DeprecationIssueType.CrossOriginWindowConfirm:
        messageFunction = i18nLazyString(UIStrings.crossOriginWindowApi, {PH1: 'window.confirm'});
        break;
      case Protocol.Audits.DeprecationIssueType.CSSSelectorInternalMediaControlsOverlayCastButton:
        messageFunction = i18nLazyString(UIStrings.cssSelectorInternalMediaControlsOverlayCastButton);
        feature = 5714245488476160;
        break;
      case Protocol.Audits.DeprecationIssueType.DeprecationExample:
        messageFunction = i18nLazyString(UIStrings.deprecationExample);
        feature = 5684289032159232;
        milestone = 100;
        break;
      case Protocol.Audits.DeprecationIssueType.DocumentDomainSettingWithoutOriginAgentClusterHeader:
        messageFunction = i18nLazyString(UIStrings.documentDomainSettingWithoutOriginAgentClusterHeader);
        milestone = 109;
        break;
      case Protocol.Audits.DeprecationIssueType.EventPath:
        messageFunction = i18nLazyString(UIStrings.eventPath);
        feature = 5726124632965120;
        milestone = 109;
        break;
      case Protocol.Audits.DeprecationIssueType.ExpectCTHeader:
        messageFunction = i18nLazyString(UIStrings.expectCTHeader);
        feature = 6244547273687040;
        milestone = 107;
        break;
      case Protocol.Audits.DeprecationIssueType.GeolocationInsecureOrigin:
        messageFunction = i18nLazyString(UIStrings.geolocationInsecureOrigin);
        break;
      case Protocol.Audits.DeprecationIssueType.GeolocationInsecureOriginDeprecatedNotRemoved:
        messageFunction = i18nLazyString(UIStrings.geolocationInsecureOriginDeprecatedNotRemoved);
        break;
      case Protocol.Audits.DeprecationIssueType.GetUserMediaInsecureOrigin:
        messageFunction = i18nLazyString(UIStrings.getUserMediaInsecureOrigin);
        break;
      case Protocol.Audits.DeprecationIssueType.HostCandidateAttributeGetter:
        messageFunction = i18nLazyString(UIStrings.hostCandidateAttributeGetter);
        break;
      case Protocol.Audits.DeprecationIssueType.IdentityInCanMakePaymentEvent:
        messageFunction = i18nLazyString(UIStrings.identityInCanMakePaymentEvent);
        feature = 5190978431352832;
        break;
      case Protocol.Audits.DeprecationIssueType.InsecurePrivateNetworkSubresourceRequest:
        messageFunction = i18nLazyString(UIStrings.insecurePrivateNetworkSubresourceRequest);
        feature = 5436853517811712;
        milestone = 92;
        break;
      case Protocol.Audits.DeprecationIssueType.LocalCSSFileExtensionRejected:
        messageFunction = i18nLazyString(UIStrings.localCSSFileExtensionRejected);
        milestone = 64;
        break;
      case Protocol.Audits.DeprecationIssueType.MediaSourceAbortRemove:
        messageFunction = i18nLazyString(UIStrings.mediaSourceAbortRemove);
        feature = 6107495151960064;
        break;
      case Protocol.Audits.DeprecationIssueType.MediaSourceDurationTruncatingBuffered:
        messageFunction = i18nLazyString(UIStrings.mediaSourceDurationTruncatingBuffered);
        feature = 6107495151960064;
        break;
      case Protocol.Audits.DeprecationIssueType.NoSysexWebMIDIWithoutPermission:
        messageFunction = i18nLazyString(UIStrings.noSysexWebMIDIWithoutPermission);
        feature = 5138066234671104;
        milestone = 82;
        break;
      case Protocol.Audits.DeprecationIssueType.NotificationInsecureOrigin:
        messageFunction = i18nLazyString(UIStrings.notificationInsecureOrigin);
        break;
      case Protocol.Audits.DeprecationIssueType.NotificationPermissionRequestedIframe:
        messageFunction = i18nLazyString(UIStrings.notificationPermissionRequestedIframe);
        feature = 6451284559265792;
        break;
      case Protocol.Audits.DeprecationIssueType.ObsoleteWebRtcCipherSuite:
        messageFunction = i18nLazyString(UIStrings.obsoleteWebRtcCipherSuite);
        milestone = 81;
        break;
      case Protocol.Audits.DeprecationIssueType.ObsoleteCreateImageBitmAPImageOrientationNone:
        messageFunction = i18nLazyString(UIStrings.obsoleteCreateImageBitmAPImageOrientationNone);
        milestone = 111;
        break;
      case Protocol.Audits.DeprecationIssueType.OpenWebDatabaseInsecureContext:
        messageFunction = i18nLazyString(UIStrings.openWebDatabaseInsecureContext);
        feature = 5175124599767040;
        milestone = 105;
        break;
      case Protocol.Audits.DeprecationIssueType.PaymentInstruments:
        messageFunction = i18nLazyString(UIStrings.paymentInstruments);
        feature = 5099285054488576;
        break;
      case Protocol.Audits.DeprecationIssueType.PaymentRequestCSPViolation:
        messageFunction = i18nLazyString(UIStrings.paymentRequestCSPViolation);
        feature = 6286595631087616;
        break;
      case Protocol.Audits.DeprecationIssueType.PersistentQuotaType:
        messageFunction = i18nLazyString(UIStrings.persistentQuotaType);
        feature = 5176235376246784;
        milestone = 106;
        break;
      case Protocol.Audits.DeprecationIssueType.PictureSourceSrc:
        messageFunction = i18nLazyString(UIStrings.pictureSourceSrc);
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedCancelAnimationFrame:
        messageFunction = i18nLazyString(
            UIStrings.vendorSpecificApi, {PH1: 'webkitCancelAnimationFrame', PH2: 'cancelAnimationFrame'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedRequestAnimationFrame:
        messageFunction = i18nLazyString(
            UIStrings.vendorSpecificApi, {PH1: 'webkitRequestAnimationFrame', PH2: 'requestAnimationFrame'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedStorageInfo:
        messageFunction = i18nLazyString(UIStrings.prefixedStorageInfo);
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedVideoDisplayingFullscreen:
        messageFunction = i18nLazyString(
            UIStrings.deprecatedWithReplacement,
            {PH1: 'HTMLVideoElement.webkitDisplayingFullscreen', PH2: 'Document.fullscreenElement'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedVideoEnterFullScreen:
        messageFunction = i18nLazyString(
            UIStrings.deprecatedWithReplacement,
            {PH1: 'HTMLVideoElement.webkitEnterFullScreen()', PH2: 'Element.requestFullscreen()'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedVideoEnterFullscreen:
        messageFunction = i18nLazyString(
            UIStrings.deprecatedWithReplacement,
            {PH1: 'HTMLVideoElement.webkitEnterFullscreen()', PH2: 'Element.requestFullscreen()'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedVideoExitFullScreen:
        messageFunction = i18nLazyString(
            UIStrings.deprecatedWithReplacement,
            {PH1: 'HTMLVideoElement.webkitExitFullScreen()', PH2: 'Document.exitFullscreen()'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedVideoExitFullscreen:
        messageFunction = i18nLazyString(
            UIStrings.deprecatedWithReplacement,
            {PH1: 'HTMLVideoElement.webkitExitFullscreen()', PH2: 'Document.exitFullscreen()'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrefixedVideoSupportsFullscreen:
        messageFunction = i18nLazyString(
            UIStrings.deprecatedWithReplacement,
            {PH1: 'HTMLVideoElement.webkitSupportsFullscreen', PH2: 'Document.fullscreenEnabled'});
        break;
      case Protocol.Audits.DeprecationIssueType.PrivacySandboxExtensionsAPI:
        messageFunction = i18nLazyString(UIStrings.privacySandboxExtensionsAPI);
        milestone = 113;
        break;
      case Protocol.Audits.DeprecationIssueType.RangeExpand:
        messageFunction =
            i18nLazyString(UIStrings.deprecatedWithReplacement, {PH1: 'Range.expand()', PH2: 'Selection.modify()'});
        break;
      case Protocol.Audits.DeprecationIssueType.RequestedSubresourceWithEmbeddedCredentials:
        messageFunction = i18nLazyString(UIStrings.requestedSubresourceWithEmbeddedCredentials);
        feature = 5669008342777856;
        break;
      case Protocol.Audits.DeprecationIssueType.OverflowVisibleOnReplacedElement:
        messageFunction = i18nLazyString(UIStrings.overflowVisibleOnReplacedElement);
        feature = 5137515594383360;
        milestone = 108;
        break;
      case Protocol.Audits.DeprecationIssueType.RTCConstraintEnableDtlsSrtpFalse:
        messageFunction = i18nLazyString(UIStrings.rtcConstraintEnableDtlsSrtpFalse);
        milestone = 97;
        break;
      case Protocol.Audits.DeprecationIssueType.RTCConstraintEnableDtlsSrtpTrue:
        messageFunction = i18nLazyString(UIStrings.rtcConstraintEnableDtlsSrtpTrue);
        milestone = 97;
        break;
      case Protocol.Audits.DeprecationIssueType.RTCPeerConnectionComplexPlanBSdpUsingDefaultSdpSemantics:
        messageFunction = i18nLazyString(UIStrings.rtcPeerConnectionComplexPlanBSdpUsingDefaultSdpSemantics);
        milestone = 72;
        break;
      case Protocol.Audits.DeprecationIssueType.RTCPeerConnectionSdpSemanticsPlanB:
        messageFunction = i18nLazyString(UIStrings.rtcPeerConnectionSdpSemanticsPlanB);
        feature = 5823036655665152;
        milestone = 93;
        break;
      case Protocol.Audits.DeprecationIssueType.RtcpMuxPolicyNegotiate:
        messageFunction = i18nLazyString(UIStrings.rtcpMuxPolicyNegotiate);
        feature = 5654810086866944;
        milestone = 62;
        break;
      case Protocol.Audits.DeprecationIssueType.SharedArrayBufferConstructedWithoutIsolation:
        messageFunction = i18nLazyString(UIStrings.sharedArrayBufferConstructedWithoutIsolation);
        milestone = 106;
        break;
      case Protocol.Audits.DeprecationIssueType.TextToSpeech_DisallowedByAutoplay:
        messageFunction = i18nLazyString(UIStrings.textToSpeech_DisallowedByAutoplay);
        feature = 5687444770914304;
        milestone = 71;
        break;
      case Protocol.Audits.DeprecationIssueType.V8SharedArrayBufferConstructedInExtensionWithoutIsolation:
        messageFunction = i18nLazyString(UIStrings.v8SharedArrayBufferConstructedInExtensionWithoutIsolation);
        milestone = 96;
        break;
      case Protocol.Audits.DeprecationIssueType.XHRJSONEncodingDetection:
        messageFunction = i18nLazyString(UIStrings.xhrJSONEncodingDetection);
        milestone = 93;
        break;
      case Protocol.Audits.DeprecationIssueType.XMLHttpRequestSynchronousInNonWorkerOutsideBeforeUnload:
        messageFunction = i18nLazyString(UIStrings.xmlHttpRequestSynchronousInNonWorkerOutsideBeforeUnload);
        break;
      case Protocol.Audits.DeprecationIssueType.XRSupportsSession:
        messageFunction = i18nLazyString(UIStrings.xrSupportsSession);
        milestone = 80;
        break;
    }
    const links = [];
    if (feature !== 0) {
      links.push({
        link: `https://chromestatus.com/feature/${feature}`,
        linkTitle: i18nLazyString(UIStrings.feature),
      });
    }
    if (milestone !== 0) {
      links.push({
        link: 'https://chromiumdash.appspot.com/schedule',
        linkTitle: i18nLazyString(UIStrings.milestone, {milestone}),
      });
    }
    return resolveLazyDescription({
      file: 'deprecation.md',
      substitutions: new Map([
        ['PLACEHOLDER_title', i18nLazyString(UIStrings.title)],
        ['PLACEHOLDER_message', messageFunction],
      ]),
      links,
    });
  }

  sources(): Iterable<Protocol.Audits.SourceCodeLocation> {
    if (this.#issueDetails.sourceCodeLocation) {
      return [this.#issueDetails.sourceCodeLocation];
    }
    return [];
  }

  primaryKey(): string {
    return JSON.stringify(this.#issueDetails);
  }

  getKind(): IssueKind {
    return IssueKind.BreakingChange;
  }

  static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue):
      DeprecationIssue[] {
    const details = inspectorIssue.details.deprecationIssueDetails;
    if (!details) {
      console.warn('Deprecation issue without details received.');
      return [];
    }
    return [new DeprecationIssue(details, issuesModel)];
  }
}
