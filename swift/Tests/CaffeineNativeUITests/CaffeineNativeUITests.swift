import SwiftUI
import XCTest
@testable import CaffeineNativeUI

final class CaffeineNativeUITests: XCTestCase {
    func testSettingsChromeMetricsMatchWarehouseBaseline() {
        XCTAssertEqual(SettingsChromeMetrics.windowWidth, 920)
        XCTAssertEqual(SettingsChromeMetrics.defaultWindowHeight, 560)
        XCTAssertEqual(SettingsChromeMetrics.minimumWindowHeight, 480)
        XCTAssertEqual(SettingsChromeMetrics.maximumWindowHeight, 1600)
        XCTAssertEqual(SettingsChromeMetrics.sidebarIdealWidth, 210)
    }

    func testNativeSettingsWindowIdentifierIsStable() {
        XCTAssertEqual(
            nativeSettingsWindowIdentifier.rawValue,
            "CaffeineNativeUI.SettingsWindow"
        )
    }

    func testSettingsAboutLinkUsesDestinationAsIdentifier() {
        let link = SettingsAboutLink(
            title: "GitHub",
            systemImage: "chevron.left.forwardslash.chevron.right",
            destination: URL(string: "https://github.com/caffeinebounce/warehouse")!
        )

        XCTAssertEqual(link.id, "https://github.com/caffeinebounce/warehouse")
        XCTAssertEqual(link.title, "GitHub")
        XCTAssertEqual(link.systemImage, "chevron.left.forwardslash.chevron.right")
    }

    func testAuthPanelMetricsExposeMediumWindowSize() {
        XCTAssertEqual(AuthPanelMetrics.windowWidth, 492)
        XCTAssertEqual(AuthPanelMetrics.windowHeight, 432)
        XCTAssertEqual(AuthPanelMetrics.windowEdgePadding, 8)
        XCTAssertEqual(AuthPanelMetrics.titlebarClearance, 16)
        XCTAssertEqual(AuthPanelMetrics.cardWidth, 448)
        XCTAssertEqual(AuthPanelMetrics.cardCornerRadius, 26)
    }

    func testAuthPanelMessageUsesToneAndTextAsStableIdentifier() {
        let errorMessage = AuthPanelMessage("Wrong password", tone: .error)
        let successMessage = AuthPanelMessage("Reset email sent", tone: .success)

        XCTAssertEqual(errorMessage.id, "error:Wrong password")
        XCTAssertEqual(successMessage.id, "success:Reset email sent")
    }

    func testLegacyCredentialsSignInFormInitializerStillBuilds() {
        let view = CredentialsSignInForm(
            symbolName: "building.2.fill",
            title: "WarehouseSync",
            subtitle: "Sign in to your account",
            email: .constant(""),
            password: .constant(""),
            isLoading: false,
            errorMessage: nil
        ) { }

        XCTAssertNotNil(view)
    }

    func testExtendedCredentialsSignInFormInitializerBuilds() {
        let view = CredentialsSignInForm(
            symbolName: "building.2.fill",
            title: "WarehouseSync",
            subtitle: "Sign in to your account",
            headerImage: Image(systemName: "app.badge"),
            email: .constant(""),
            password: .constant(""),
            isLoading: false,
            errorMessage: nil,
            auxiliaryMessage: "Reset email sent."
        ) { } secondaryAction: {
            Text("Forgot Password?")
        }

        XCTAssertNotNil(view)
    }
}
