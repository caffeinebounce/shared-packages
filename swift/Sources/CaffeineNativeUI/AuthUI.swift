import SwiftUI

public enum AuthPanelMetrics {
    public static let windowWidth: CGFloat = 492
    public static let windowHeight: CGFloat = 492
    public static let windowEdgePadding: CGFloat = 12
    public static let titlebarClearance: CGFloat = 24
    public static let cardWidth: CGFloat = 448
    public static let cardCornerRadius: CGFloat = 26
    public static let cardPadding: CGFloat = 24
    public static let headerImageSize: CGFloat = 76
    public static let symbolBadgeSize: CGFloat = 64
    public static let fieldHeight: CGFloat = 44
    public static let fieldCornerRadius: CGFloat = 14
}

public enum AuthPanelMessageTone: Equatable {
    case error
    case success
}

public struct AuthPanelMessage: Identifiable, Equatable {
    public let text: String
    public let tone: AuthPanelMessageTone

    public var id: String {
        "\(tone.idPrefix):\(text)"
    }

    public init(_ text: String, tone: AuthPanelMessageTone) {
        self.text = text
        self.tone = tone
    }
}

public struct AuthPanelShell<Fields: View, PrimaryAction: View>: View {
    @Environment(\.colorScheme) private var colorScheme

    private let title: String
    private let subtitle: String
    private let symbolName: String?
    private let headerImage: Image?
    private let messages: [AuthPanelMessage]
    private let fields: Fields
    private let primaryAction: PrimaryAction
    private let secondaryAction: AnyView?

    public init(
        title: String,
        subtitle: String,
        symbolName: String? = nil,
        headerImage: Image? = nil,
        messages: [AuthPanelMessage] = [],
        @ViewBuilder fields: () -> Fields,
        @ViewBuilder primaryAction: () -> PrimaryAction
    ) {
        self.title = title
        self.subtitle = subtitle
        self.symbolName = symbolName
        self.headerImage = headerImage
        self.messages = messages
        self.fields = fields()
        self.primaryAction = primaryAction()
        self.secondaryAction = nil
    }

    public init<SecondaryAction: View>(
        title: String,
        subtitle: String,
        symbolName: String? = nil,
        headerImage: Image? = nil,
        messages: [AuthPanelMessage] = [],
        @ViewBuilder fields: () -> Fields,
        @ViewBuilder primaryAction: () -> PrimaryAction,
        @ViewBuilder secondaryAction: () -> SecondaryAction
    ) {
        self.title = title
        self.subtitle = subtitle
        self.symbolName = symbolName
        self.headerImage = headerImage
        self.messages = messages
        self.fields = fields()
        self.primaryAction = primaryAction()
        self.secondaryAction = AnyView(secondaryAction())
    }

    public var body: some View {
        ZStack {
            SettingsMaterialBackground(material: .underWindowBackground)

            Color.white
                .opacity(colorScheme == .dark ? 0.035 : 0.62)
                .allowsHitTesting(false)

            LinearGradient(
                colors: [
                    Color.accentColor.opacity(colorScheme == .dark ? 0.18 : 0.08),
                    Color.clear,
                    Color.primary.opacity(colorScheme == .dark ? 0.06 : 0.025),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .allowsHitTesting(false)

            VStack(spacing: 0) {
                Color.clear
                    .frame(height: AuthPanelMetrics.titlebarClearance)

                authCard

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .padding(.horizontal, AuthPanelMetrics.windowEdgePadding)
            .padding(.top, AuthPanelMetrics.windowEdgePadding)
            .padding(.bottom, AuthPanelMetrics.windowEdgePadding)
        }
        .frame(width: AuthPanelMetrics.windowWidth, height: AuthPanelMetrics.windowHeight)
        .ignoresSafeArea()
    }

    private var authCard: some View {
        VStack(spacing: 0) {
            VStack(spacing: 16) {
                headerVisual

                VStack(spacing: 4) {
                    Text(title)
                        .font(.system(size: 30, weight: .semibold))
                        .multilineTextAlignment(.center)

                    Text(subtitle)
                        .font(.title3)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.bottom, 22)

            VStack(spacing: 12) {
                fields
            }

            if let secondaryAction {
                HStack {
                    Spacer(minLength: 0)
                    secondaryAction
                }
                .padding(.top, 10)
            }

            if !messages.isEmpty {
                VStack(spacing: 10) {
                    ForEach(messages) { message in
                        AuthPanelMessageRow(message: message)
                    }
                }
                .padding(.top, 14)
            }

            primaryAction
                .padding(.top, 14)
        }
        .padding(AuthPanelMetrics.cardPadding)
        .frame(maxWidth: AuthPanelMetrics.cardWidth)
        .background(AuthPanelSurface())
        .shadow(
            color: Color.black.opacity(colorScheme == .dark ? 0.34 : 0.12),
            radius: colorScheme == .dark ? 30 : 18,
            y: 12
        )
    }

    @ViewBuilder
    private var headerVisual: some View {
        if let headerImage {
            headerImage
                .resizable()
                .interpolation(.high)
                .aspectRatio(contentMode: .fit)
                .frame(
                    width: AuthPanelMetrics.headerImageSize,
                    height: AuthPanelMetrics.headerImageSize
                )
                .clipShape(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                )
                .shadow(color: Color.black.opacity(0.16), radius: 16, y: 8)
                .accessibilityHidden(true)
        } else if let symbolName, !symbolName.isEmpty {
            ZStack {
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.accentColor.opacity(colorScheme == .dark ? 0.26 : 0.18),
                                Color.accentColor.opacity(colorScheme == .dark ? 0.12 : 0.08),
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                Image(systemName: symbolName)
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundStyle(Color.accentColor)
            }
            .frame(
                width: AuthPanelMetrics.symbolBadgeSize,
                height: AuthPanelMetrics.symbolBadgeSize
            )
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .strokeBorder(Color.white.opacity(colorScheme == .dark ? 0.08 : 0.35), lineWidth: 1)
            )
            .accessibilityHidden(true)
        }
    }
}

private extension AuthPanelMessageTone {
    var idPrefix: String {
        switch self {
        case .error:
            return "error"
        case .success:
            return "success"
        }
    }

    var systemImage: String {
        switch self {
        case .error:
            return "exclamationmark.triangle.fill"
        case .success:
            return "checkmark.circle.fill"
        }
    }

    var tint: Color {
        switch self {
        case .error:
            return .red
        case .success:
            return .green
        }
    }
}

private struct AuthPanelSurface: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        RoundedRectangle(
            cornerRadius: AuthPanelMetrics.cardCornerRadius,
            style: .continuous
        )
        .fill(surfaceFill)
        .overlay(
            RoundedRectangle(
                cornerRadius: AuthPanelMetrics.cardCornerRadius,
                style: .continuous
            )
            .strokeBorder(surfaceStroke, lineWidth: 1)
        )
    }

    private var surfaceFill: some ShapeStyle {
        Color.white.opacity(colorScheme == .dark ? 0.11 : 0.84)
    }

    private var surfaceStroke: Color {
        colorScheme == .dark
            ? Color.white.opacity(0.1)
            : Color.black.opacity(0.08)
    }
}

private struct AuthPanelMessageRow: View {
    @Environment(\.colorScheme) private var colorScheme

    let message: AuthPanelMessage

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: message.tone.systemImage)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(message.tone.tint)
                .padding(.top, 1)

            Text(message.text)
                .font(.callout)
                .foregroundStyle(.primary)
                .multilineTextAlignment(.leading)

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 11)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(message.tone.tint.opacity(colorScheme == .dark ? 0.16 : 0.10))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .strokeBorder(message.tone.tint.opacity(colorScheme == .dark ? 0.24 : 0.16), lineWidth: 1)
        )
    }
}
