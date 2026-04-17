import SwiftUI

public struct SettingsAboutLink: Hashable, Identifiable {
    public let title: String
    public let systemImage: String
    public let destination: URL

    public var id: String {
        destination.absoluteString
    }

    public init(title: String, systemImage: String, destination: URL) {
        self.title = title
        self.systemImage = systemImage
        self.destination = destination
    }
}

public struct SettingsAboutPane<Controls: View, Footer: View>: View {
    public let title: String
    public let subtitle: String?
    public let icon: Image
    public let appName: String
    public let versionDescription: String
    public let buildDescription: String?
    public let summary: String?
    public let links: [SettingsAboutLink]

    private let controls: AnyView?
    private let footer: AnyView?

    public init(
        title: String = "About",
        subtitle: String? = nil,
        icon: Image,
        appName: String,
        versionDescription: String,
        buildDescription: String? = nil,
        summary: String? = nil,
        links: [SettingsAboutLink] = []
    ) where Controls == EmptyView, Footer == EmptyView {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.appName = appName
        self.versionDescription = versionDescription
        self.buildDescription = buildDescription
        self.summary = summary
        self.links = links
        self.controls = nil
        self.footer = nil
    }

    public init(
        title: String = "About",
        subtitle: String? = nil,
        icon: Image,
        appName: String,
        versionDescription: String,
        buildDescription: String? = nil,
        summary: String? = nil,
        links: [SettingsAboutLink] = [],
        @ViewBuilder controls: () -> Controls
    ) where Footer == EmptyView {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.appName = appName
        self.versionDescription = versionDescription
        self.buildDescription = buildDescription
        self.summary = summary
        self.links = links
        self.controls = AnyView(controls())
        self.footer = nil
    }

    public init(
        title: String = "About",
        subtitle: String? = nil,
        icon: Image,
        appName: String,
        versionDescription: String,
        buildDescription: String? = nil,
        summary: String? = nil,
        links: [SettingsAboutLink] = [],
        @ViewBuilder controls: () -> Controls,
        @ViewBuilder footer: () -> Footer
    ) {
        self.title = title
        self.subtitle = subtitle
        self.icon = icon
        self.appName = appName
        self.versionDescription = versionDescription
        self.buildDescription = buildDescription
        self.summary = summary
        self.links = links
        self.controls = AnyView(controls())
        self.footer = AnyView(footer())
    }

    public var body: some View {
        SettingsContentContainer(
            title: title,
            subtitle: subtitle,
            layout: .form
        ) {
            VStack(alignment: .leading, spacing: 28) {
                VStack(spacing: 16) {
                    icon
                        .resizable()
                        .interpolation(.high)
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 132, height: 132)
                        .accessibilityHidden(true)

                    VStack(spacing: 6) {
                        Text(appName)
                            .font(.system(size: 34, weight: .semibold))
                            .multilineTextAlignment(.center)

                        Text(versionDescription)
                            .font(.title3)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)

                        if let buildDescription, !buildDescription.isEmpty {
                            Text(buildDescription)
                                .font(.body)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                    }

                    if let summary, !summary.isEmpty {
                        Text(summary)
                            .font(.body)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: 560)
                    }
                }
                .frame(maxWidth: .infinity)

                if !links.isEmpty {
                    VStack(spacing: 10) {
                        ForEach(links) { link in
                            Link(destination: link.destination) {
                                Label(link.title, systemImage: link.systemImage)
                                    .font(.title3.weight(.medium))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .foregroundStyle(Color.accentColor)
                    .frame(maxWidth: .infinity)
                }

                if let controls {
                    Divider()

                    controls
                        .frame(maxWidth: .infinity)
                }

                if let footer {
                    Divider()

                    footer
                        .frame(maxWidth: .infinity)
                }
            }
            .frame(maxWidth: .infinity, alignment: .top)
        }
    }
}
