import SwiftUI

public struct CredentialsSignInForm: View {
    private let symbolName: String
    private let title: String
    private let subtitle: String
    private let submitTitle: String
    @Binding private var email: String
    @Binding private var password: String
    private let isLoading: Bool
    private let errorMessage: String?
    private let onSubmit: () async -> Void

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
        _email = email
        _password = password
        self.isLoading = isLoading
        self.errorMessage = errorMessage
        self.onSubmit = onSubmit
    }

    public var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Image(systemName: symbolName)
                    .font(.system(size: 48))
                    .foregroundStyle(Color.accentColor)
                Text(title)
                    .font(.title)
                    .fontWeight(.bold)
                Text(subtitle)
                    .foregroundStyle(.secondary)
            }

            VStack(spacing: 12) {
                TextField("Email", text: $email)
                    .textFieldStyle(.roundedBorder)
                    .disableAutocorrection(true)
                    .onSubmit { submit() }

                SecureField("Password", text: $password)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit { submit() }

                if let errorMessage, !errorMessage.isEmpty {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.caption)
                        .multilineTextAlignment(.center)
                }
            }

            Button(action: submit) {
                HStack {
                    if isLoading {
                        ProgressView()
                            .controlSize(.small)
                            .padding(.trailing, 4)
                    }
                    Text(submitTitle)
                        .frame(maxWidth: .infinity)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(email.isEmpty || password.isEmpty || isLoading)
        }
        .padding(40)
        .frame(width: 360)
    }

    private func submit() {
        Task {
            await onSubmit()
        }
    }
}
