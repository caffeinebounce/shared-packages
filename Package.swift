// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "shared-packages",
    platforms: [
        .macOS(.v14),
    ],
    products: [
        .library(
            name: "CaffeineNativeUI",
            targets: ["CaffeineNativeUI"]
        ),
    ],
    targets: [
        .target(
            name: "CaffeineNativeUI",
            path: "swift/Sources/CaffeineNativeUI"
        ),
        .testTarget(
            name: "CaffeineNativeUITests",
            dependencies: ["CaffeineNativeUI"],
            path: "swift/Tests/CaffeineNativeUITests"
        ),
    ]
)
