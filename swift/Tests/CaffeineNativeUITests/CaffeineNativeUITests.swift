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
}
