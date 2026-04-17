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
}
