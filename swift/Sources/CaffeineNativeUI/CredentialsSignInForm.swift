import SwiftUI

public struct CredentialsSignInForm: View {
    private enum FieldFocusTarget: Hashable {
        case email
        case password
    }

    private let symbolName: String
    private let title: String
    private let subtitle: String
    private let submitTitle: String
    private let headerImage: Image?
    @Binding private var email: String
    @Binding private var password: String
    private let isLoading: Bool
    private let errorMessage: String?
    private let auxiliaryMessage: String?
    private let secondaryAction: AnyView?
    private let onSubmit: () async -> Void
    @State private var isPasswordVisible = false
    @FocusState private var focusedField: FieldFocusTarget?

    public init(
        symbolName: String,
        title: String,
        subtitle: String,
        submitTitle: String = "Sign In",
        email: Binding<String>,
        password: Binding<String>,
        isLoading: Bool,
        errorMessage: String?,
        onSubmit: @escaping () async -> Void
    ) {
        self.symbolName = symbolName
        self.title = title
        self.subtitle = subtitle
        self.submitTitle = submitTitle
        self.headerImage = nil
        _email = email
        _password = password
        self.isLoading = isLoading
        self.errorMessage = errorMessage
        self.auxiliaryMessage = nil
        self.secondaryAction = nil
        self.onSubmit = onSubmit
    }

    public init(
        symbolName: String,
        title: String,
        subtitle: String,
        submitTitle: String = "Sign In",
        headerImage: Image?,
        email: Binding<String>,
        password: Binding<String>,
        isLoading: Bool,
        errorMessage: String?,
        auxiliaryMessage: String? = nil,
        onSubmit: @escaping () async -> Void
    ) {
        self.symbolName = symbolName
        self.title = title
        self.subtitle = subtitle
        self.submitTitle = submitTitle
        self.headerImage = headerImage
        _email = email
        _password = password
        self.isLoading = isLoading
        self.errorMessage = errorMessage
        self.auxiliaryMessage = auxiliaryMessage
        self.secondaryAction = nil
        self.onSubmit = onSubmit
    }

    public init<SecondaryAction: View>(
        symbolName: String,
        title: String,
        subtitle: String,
        submitTitle: String = "Sign In",
        headerImage: Image?,
        email: Binding<String>,
        password: Binding<String>,
        isLoading: Bool,
        errorMessage: String?,
        auxiliaryMessage: String? = nil,
        onSubmit: @escaping () async -> Void,
        @ViewBuilder secondaryAction: () -> SecondaryAction
    ) {
        self.symbolName = symbolName
        self.title = title
        self.subtitle = subtitle
        self.submitTitle = submitTitle
        self.headerImage = headerImage
        _email = email
        _password = password
        self.isLoading = isLoading
        self.errorMessage = errorMessage
        self.auxiliaryMessage = auxiliaryMessage
        self.secondaryAction = AnyView(secondaryAction())
        self.onSubmit = onSubmit
    }

    public var body: some View {
        formShell
    }

    @ViewBuilder
    private var formShell: some View {
        if let secondaryAction {
            AuthPanelShell(
                title: title,
                subtitle: subtitle,
                symbolName: symbolName,
                headerImage: headerImage,
                messages: statusMessages
            ) {
                fields
            } primaryAction: {
                primaryButton
            } secondaryAction: {
                secondaryAction
            }
        } else {
            AuthPanelShell(
                title: title,
                subtitle: subtitle,
                symbolName: symbolName,
                headerImage: headerImage,
                messages: statusMessages
            ) {
                fields
            } primaryAction: {
                primaryButton
            }
        }
    }

    private var fields: some View {
        VStack(spacing: 12) {
            AuthInputField(
                isFocused: focusedField == .email,
                onActivate: { focusedField = .email }
            ) {
                TextField("Email", text: $email)
                    .textFieldStyle(.plain)
                    .disableAutocorrection(true)
                    .focused($focusedField, equals: .email)
                    .onSubmit { submit() }
            }

            AuthInputField(
                isFocused: focusedField == .password,
                onActivate: { focusedField = .password }
            ) {
                Group {
                    if isPasswordVisible {
                        TextField("Password", text: $password)
                            .textFieldStyle(.plain)
                    } else {
                        SecureField("Password", text: $password)
                            .textFieldStyle(.plain)
                    }
                }
                .focused($focusedField, equals: .password)
                .onSubmit { submit() }
            } trailingAccessory: {
                Button {
                    isPasswordVisible.toggle()
                    focusedField = .password
                } label: {
                    Image(systemName: isPasswordVisible ? "eye.slash" : "eye")
                        .font(.system(size: 14, weight: .semibold))
                        .frame(width: 18, height: 18)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.secondary)
                .accessibilityLabel(isPasswordVisible ? "Hide password" : "Show password")
            }
        }
    }

    private var primaryButton: some View {
        Button(action: submit) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .controlSize(.small)
                }
                Text(submitTitle)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .buttonStyle(AuthPrimaryButtonStyle())
        .frame(height: AuthPanelMetrics.fieldHeight)
        .keyboardShortcut(.defaultAction)
        .disabled(email.isEmpty || password.isEmpty || isLoading)
    }

    private var statusMessages: [AuthPanelMessage] {
        var messages: [AuthPanelMessage] = []

        if let errorMessage, !errorMessage.isEmpty {
            messages.append(AuthPanelMessage(errorMessage, tone: .error))
        }

        if let auxiliaryMessage, !auxiliaryMessage.isEmpty {
            messages.append(AuthPanelMessage(auxiliaryMessage, tone: .success))
        }

        return messages
    }

    private func submit() {
        Task {
            await onSubmit()
        }
    }
}

private struct AuthInputField<Content: View, TrailingAccessory: View>: View {
    @Environment(\.colorScheme) private var colorScheme

    let isFocused: Bool
    let onActivate: () -> Void
    let content: Content
    let trailingAccessory: TrailingAccessory?

    init(
        isFocused: Bool,
        onActivate: @escaping () -> Void,
        @ViewBuilder content: () -> Content
    ) where TrailingAccessory == EmptyView {
        self.isFocused = isFocused
        self.onActivate = onActivate
        self.content = content()
        self.trailingAccessory = nil
    }

    init(
        isFocused: Bool,
        onActivate: @escaping () -> Void,
        @ViewBuilder content: () -> Content,
        @ViewBuilder trailingAccessory: () -> TrailingAccessory
    ) {
        self.isFocused = isFocused
        self.onActivate = onActivate
        self.content = content()
        self.trailingAccessory = trailingAccessory()
    }

    var body: some View {
        HStack(spacing: 10) {
            content
                .font(.body)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)

            if let trailingAccessory {
                trailingAccessory
            }
        }
        .padding(.horizontal, 14)
        .frame(height: AuthPanelMetrics.fieldHeight)
            .background(fieldShape.fill(backgroundColor))
            .overlay(fieldShape.strokeBorder(borderColor, lineWidth: borderWidth))
            .shadow(color: shadowColor, radius: shadowRadius)
            .contentShape(fieldShape)
            .onTapGesture(perform: onActivate)
            .animation(.easeOut(duration: 0.14), value: isFocused)
    }

    private var fieldShape: RoundedRectangle {
        RoundedRectangle(
            cornerRadius: AuthPanelMetrics.fieldCornerRadius,
            style: .continuous
        )
    }

    private var backgroundColor: Color {
        if isFocused {
            return colorScheme == .dark
                ? Color.white.opacity(0.10)
                : Color.white.opacity(0.96)
        }

        return colorScheme == .dark
            ? Color.white.opacity(0.06)
            : Color.black.opacity(0.04)
    }

    private var borderColor: Color {
        if isFocused {
            return Color.accentColor.opacity(colorScheme == .dark ? 0.95 : 0.78)
        }

        return colorScheme == .dark
            ? Color.white.opacity(0.08)
            : Color.black.opacity(0.08)
    }

    private var borderWidth: CGFloat {
        isFocused ? 2 : 1
    }

    private var shadowColor: Color {
        isFocused
            ? Color.accentColor.opacity(colorScheme == .dark ? 0.30 : 0.16)
            : .clear
    }

    private var shadowRadius: CGFloat {
        isFocused ? 10 : 0
    }
}

private struct AuthPrimaryButtonStyle: ButtonStyle {
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.isEnabled) private var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .foregroundStyle(.white.opacity(isEnabled ? 0.95 : 0.72))
            .background(
                RoundedRectangle(
                    cornerRadius: AuthPanelMetrics.fieldCornerRadius,
                    style: .continuous
                )
                .fill(backgroundFill(isPressed: configuration.isPressed))
            )
            .overlay(
                RoundedRectangle(
                    cornerRadius: AuthPanelMetrics.fieldCornerRadius,
                    style: .continuous
                )
                .strokeBorder(
                    Color.white.opacity(colorScheme == .dark ? 0.1 : 0.22),
                    lineWidth: 1
                )
            )
            .opacity(isEnabled ? 1 : 0.6)
            .scaleEffect(configuration.isPressed ? 0.995 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }

    private func backgroundFill(isPressed: Bool) -> some ShapeStyle {
        LinearGradient(
            colors: [
                Color.accentColor.opacity(isPressed ? 0.8 : 0.92),
                Color.accentColor.opacity(isPressed ? 0.62 : 0.76),
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}
