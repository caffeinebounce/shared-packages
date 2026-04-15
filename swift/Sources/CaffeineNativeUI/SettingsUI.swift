import AppKit
import SwiftUI

public enum SettingsChromeMetrics {
    public static let contentTopPadding: CGFloat = 24
    public static let windowWidth: CGFloat = 920
    public static let defaultWindowHeight: CGFloat = 560
    public static let minimumWindowHeight: CGFloat = 480
    public static let maximumWindowHeight: CGFloat = 1600
    public static let sidebarMinWidth: CGFloat = 180
    public static let sidebarIdealWidth: CGFloat = 210
    public static let sidebarMaxWidth: CGFloat = 240
}

public let nativeSettingsWindowIdentifier =
    NSUserInterfaceItemIdentifier("CaffeineNativeUI.SettingsWindow")

private let settingsSidebarBackdropIdentifier =
    NSUserInterfaceItemIdentifier("CaffeineNativeUI.SettingsSidebarBackdrop")
private let settingsSidebarBackdropWidthConstraintIdentifier =
    "CaffeineNativeUI.SettingsSidebarBackdropWidthConstraint"

public enum SettingsSidebarSurface {
    public static func nsColor(for colorScheme: ColorScheme) -> NSColor {
        colorScheme == .dark ? .underPageBackgroundColor : .controlBackgroundColor
    }
}

public struct SettingsWindowChromeConfigurator: NSViewRepresentable {
    public let sidebarWidth: CGFloat
    public let sidebarColor: NSColor

    public init(sidebarWidth: CGFloat, sidebarColor: NSColor) {
        self.sidebarWidth = sidebarWidth
        self.sidebarColor = sidebarColor
    }

    public func makeNSView(context: Context) -> NSView {
        let view = SettingsWindowObserverView()
        view.onWindowAvailable = configure(window:)
        return view
    }

    public func updateNSView(_ nsView: NSView, context: Context) {
        configure(window: nsView.window)
    }

    @MainActor
    private func configure(window: NSWindow?) {
        guard let window else { return }

        window.identifier = nativeSettingsWindowIdentifier
        window.title = ""
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.isMovableByWindowBackground = true
        window.toolbar?.showsBaselineSeparator = false
        window.styleMask.insert(.resizable)
        window.styleMask.insert(.fullSizeContentView)
        window.contentMinSize = NSSize(
            width: SettingsChromeMetrics.windowWidth,
            height: SettingsChromeMetrics.minimumWindowHeight
        )
        window.contentMaxSize = NSSize(
            width: SettingsChromeMetrics.windowWidth,
            height: SettingsChromeMetrics.maximumWindowHeight
        )

        let constrainedHeight = min(
            max(window.contentLayoutRect.height, SettingsChromeMetrics.minimumWindowHeight),
            SettingsChromeMetrics.maximumWindowHeight
        )
        let constrainedContentSize = NSSize(
            width: SettingsChromeMetrics.windowWidth,
            height: constrainedHeight
        )

        let currentContentSize = window.contentLayoutRect.size
        if currentContentSize.width != constrainedContentSize.width ||
            currentContentSize.height != constrainedContentSize.height {
            window.setContentSize(constrainedContentSize)
        }

        configureSidebarBackdrop(for: window)
    }

    @MainActor
    private func configureSidebarBackdrop(for window: NSWindow) {
        guard let frameView = window.contentView?.superview else { return }

        if let legacyContainer = window.standardWindowButton(.closeButton)?.superview,
           legacyContainer !== frameView {
            removeLegacySidebarBackdrop(from: legacyContainer)
        }

        let backdropView = sidebarBackdropView(in: frameView, contentView: window.contentView)
        backdropView.layer?.backgroundColor = sidebarColor.cgColor
        backdropView.isHidden = sidebarWidth <= 0

        if let widthConstraint = sidebarBackdropWidthConstraint(for: backdropView) {
            widthConstraint.constant = sidebarWidth
        }
    }

    @MainActor
    private func sidebarBackdropView(in container: NSView, contentView: NSView?) -> NSView {
        if let existing = container.subviews.first(where: { $0.identifier == settingsSidebarBackdropIdentifier }) {
            return existing
        }

        let backdropView = NSView()
        backdropView.identifier = settingsSidebarBackdropIdentifier
        backdropView.wantsLayer = true
        backdropView.translatesAutoresizingMaskIntoConstraints = false

        if let contentView {
            container.addSubview(backdropView, positioned: .below, relativeTo: contentView)
        } else {
            container.addSubview(backdropView)
        }

        let widthConstraint = backdropView.widthAnchor.constraint(equalToConstant: sidebarWidth)
        widthConstraint.identifier = settingsSidebarBackdropWidthConstraintIdentifier
        NSLayoutConstraint.activate([
            backdropView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            backdropView.topAnchor.constraint(equalTo: container.topAnchor),
            backdropView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            widthConstraint,
        ])

        return backdropView
    }

    @MainActor
    private func sidebarBackdropWidthConstraint(for view: NSView) -> NSLayoutConstraint? {
        view.constraints.first { $0.identifier == settingsSidebarBackdropWidthConstraintIdentifier }
    }

    @MainActor
    private func removeLegacySidebarBackdrop(from container: NSView) {
        container.subviews
            .filter { $0.identifier == settingsSidebarBackdropIdentifier }
            .forEach { $0.removeFromSuperview() }
    }
}

private final class SettingsWindowObserverView: NSView {
    var onWindowAvailable: ((NSWindow?) -> Void)?

    public override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        DispatchQueue.main.async { [weak self] in
            self?.onWindowAvailable?(self?.window)
        }
    }
}

public struct SettingsNavigationShell<Sidebar: View, Detail: View>: View {
    @Environment(\.colorScheme) private var colorScheme
    @State private var columnVisibility: NavigationSplitViewVisibility = .all
    @State private var sidebarWidth: CGFloat

    private let minSidebarWidth: CGFloat
    private let idealSidebarWidth: CGFloat
    private let maxSidebarWidth: CGFloat
    private let sidebar: Sidebar
    private let detail: Detail

    public init(
        minSidebarWidth: CGFloat = SettingsChromeMetrics.sidebarMinWidth,
        idealSidebarWidth: CGFloat = SettingsChromeMetrics.sidebarIdealWidth,
        maxSidebarWidth: CGFloat = SettingsChromeMetrics.sidebarMaxWidth,
        @ViewBuilder sidebar: () -> Sidebar,
        @ViewBuilder detail: () -> Detail
    ) {
        self.minSidebarWidth = minSidebarWidth
        self.idealSidebarWidth = idealSidebarWidth
        self.maxSidebarWidth = maxSidebarWidth
        self.sidebar = sidebar()
        self.detail = detail()
        _sidebarWidth = State(initialValue: idealSidebarWidth)
    }

    public var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility) {
            ZStack(alignment: .trailing) {
                Color.clear

                sidebar
                    .background(
                        GeometryReader { proxy in
                            Color.clear.preference(
                                key: SettingsSidebarWidthPreferenceKey.self,
                                value: proxy.size.width
                            )
                        }
                    )

                Rectangle()
                    .fill(Color.primary.opacity(0.08))
                    .frame(width: 1)
                    .allowsHitTesting(false)
            }
            .navigationSplitViewColumnWidth(
                min: minSidebarWidth,
                ideal: idealSidebarWidth,
                max: maxSidebarWidth
            )
        } detail: {
            ZStack {
                SettingsMaterialBackground(material: .contentBackground)
                detailSurfaceTint

                detail
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        }
        .navigationSplitViewStyle(.balanced)
        .toolbarBackground(.hidden, for: .windowToolbar)
        .background(
            SettingsWindowChromeConfigurator(
                sidebarWidth: columnVisibility == .detailOnly ? 0 : sidebarWidth,
                sidebarColor: SettingsSidebarSurface.nsColor(for: colorScheme)
            )
        )
        .onPreferenceChange(SettingsSidebarWidthPreferenceKey.self) { sidebarWidth = $0 }
    }

    private var detailSurfaceTint: some View {
        Color.black
            .opacity(colorScheme == .dark ? 0.04 : 0)
            .allowsHitTesting(false)
    }
}

private struct SettingsSidebarWidthPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = SettingsChromeMetrics.sidebarIdealWidth

    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

public struct SettingsPaneHeader: View {
    public let title: String
    public let subtitle: String?

    public init(title: String, subtitle: String? = nil) {
        self.title = title
        self.subtitle = subtitle
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.system(size: 28, weight: .semibold))

            if let subtitle, !subtitle.isEmpty {
                Text(subtitle)
                    .font(.body)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

public enum SettingsContentLayout {
    case readable(maxWidth: CGFloat)
    case flexible

    public static let compactForm = SettingsContentLayout.readable(maxWidth: 640)
    public static let form = SettingsContentLayout.readable(maxWidth: 960)
    public static let wideForm = SettingsContentLayout.readable(maxWidth: 1120)
}

public struct SettingsContentContainer<Content: View>: View {
    public let title: String
    public let subtitle: String?
    public let layout: SettingsContentLayout
    private let content: Content

    public init(
        title: String,
        subtitle: String? = nil,
        layout: SettingsContentLayout = .form,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.layout = layout
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            constrainedSection(
                SettingsPaneHeader(title: title, subtitle: subtitle)
            )

            constrainedSection(
                content
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            )
        }
        .padding(.top, SettingsChromeMetrics.contentTopPadding)
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }

    @ViewBuilder
    private func constrainedSection<Section: View>(_ section: Section) -> some View {
        switch layout {
        case .readable(let maxWidth):
            section.frame(maxWidth: maxWidth, alignment: .leading)
        case .flexible:
            section.frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

public struct SettingsMaterialBackground: NSViewRepresentable {
    public let material: NSVisualEffectView.Material

    public init(material: NSVisualEffectView.Material) {
        self.material = material
    }

    public func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.blendingMode = .withinWindow
        view.state = .active
        return view
    }

    public func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        nsView.material = material
    }
}

public struct SettingsInsetSection<Content: View>: View {
    public let title: String
    private let content: Content

    public init(_ title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.headline)

            SettingsSectionSurface {
                content
            }
        }
    }
}

public struct SettingsSectionSurface<Content: View>: View {
    @Environment(\.colorScheme) private var colorScheme
    private let content: Content

    public init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 0) {
            content
        }
        .background(surfaceFill)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(surfaceStroke, lineWidth: 1)
        )
    }

    private var surfaceFill: some ShapeStyle {
        Color.white.opacity(colorScheme == .dark ? 0.07 : 0.82)
    }

    private var surfaceStroke: Color {
        colorScheme == .dark
            ? Color.white.opacity(0.07)
            : Color.black.opacity(0.08)
    }
}

public struct SettingsControlRow<Accessory: View>: View {
    public let title: String
    public let subtitle: String?
    public let showsDivider: Bool
    private let accessory: Accessory

    public init(
        _ title: String,
        subtitle: String? = nil,
        showsDivider: Bool = true,
        @ViewBuilder accessory: () -> Accessory
    ) {
        self.title = title
        self.subtitle = subtitle
        self.showsDivider = showsDivider
        self.accessory = accessory()
    }

    public var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: subtitle == nil ? .center : .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.body)

                    if let subtitle, !subtitle.isEmpty {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer(minLength: 16)

                accessory
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, subtitle == nil ? 12 : 14)

            if showsDivider {
                Divider()
                    .padding(.leading, 16)
            }
        }
    }
}

public struct ResponsiveSettingsValueText: View {
    public let value: String
    public let font: Font
    public let lineLimit: Int

    public init(_ value: String, font: Font = .body, lineLimit: Int = 2) {
        self.value = value
        self.font = font
        self.lineLimit = lineLimit
    }

    public var body: some View {
        ViewThatFits(in: .horizontal) {
            Text(value)
                .font(font)
                .foregroundStyle(.secondary)
                .lineLimit(1)
                .truncationMode(.middle)

            Text(value)
                .font(font)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.trailing)
                .lineLimit(lineLimit)
                .truncationMode(.middle)
                .fixedSize(horizontal: false, vertical: true)
        }
        .textSelection(.enabled)
    }
}

public struct SettingsEmptyState: View {
    public let title: String
    public let message: String
    public let symbol: String

    public init(title: String, message: String, symbol: String) {
        self.title = title
        self.message = message
        self.symbol = symbol
    }

    public var body: some View {
        ContentUnavailableView {
            Label(title, systemImage: symbol)
        } description: {
            Text(message)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
