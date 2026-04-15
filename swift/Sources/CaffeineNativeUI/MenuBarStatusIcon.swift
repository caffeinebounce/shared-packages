import AppKit
import SwiftUI

public struct MenuBarStatusIcon: View {
    @Environment(\.colorScheme) private var colorScheme

    public let systemImageName: String
    public let accessibilityLabelText: String
    public let statusColor: NSColor
    public let symbolPointSize: CGFloat
    public let symbolWeight: NSFont.Weight
    public let symbolSize: CGSize
    public let symbolOffset: CGSize
    public let dotSize: CGFloat

    public init(
        systemImageName: String,
        accessibilityLabel: String,
        statusColor: NSColor,
        symbolPointSize: CGFloat = 14,
        symbolWeight: NSFont.Weight = .medium,
        symbolSize: CGSize = CGSize(width: 18, height: 18),
        symbolOffset: CGSize = CGSize(width: -1, height: 0),
        dotSize: CGFloat = 7
    ) {
        self.systemImageName = systemImageName
        self.accessibilityLabelText = accessibilityLabel
        self.statusColor = statusColor
        self.symbolPointSize = symbolPointSize
        self.symbolWeight = symbolWeight
        self.symbolSize = symbolSize
        self.symbolOffset = symbolOffset
        self.dotSize = dotSize
    }

    public var body: some View {
        Image(nsImage: menuBarImage)
            .accessibilityLabel(accessibilityLabelText)
    }

    private var menuBarImage: NSImage {
        let size = NSSize(width: 22, height: 22)
        let baseColor: NSColor = colorScheme == .dark ? .white : .black
        let dotStrokeColor = colorScheme == .dark
            ? NSColor.white.withAlphaComponent(0.35)
            : NSColor.black.withAlphaComponent(0.25)

        let image = NSImage(size: size, flipped: false) { rect in
            if let baseSymbol = NSImage(
                systemSymbolName: systemImageName,
                accessibilityDescription: accessibilityLabelText
            ) {
                let paletteConfig = NSImage.SymbolConfiguration(paletteColors: [baseColor])
                let sizeConfig = NSImage.SymbolConfiguration(
                    pointSize: symbolPointSize,
                    weight: symbolWeight
                )
                let configured = baseSymbol.withSymbolConfiguration(
                    paletteConfig.applying(sizeConfig)
                ) ?? baseSymbol

                let origin = NSPoint(
                    x: (rect.width - symbolSize.width) / 2 + symbolOffset.width,
                    y: (rect.height - symbolSize.height) / 2 + symbolOffset.height
                )
                configured.draw(in: NSRect(origin: origin, size: symbolSize))
            }

            let dotRect = NSRect(
                x: rect.width - dotSize - 1,
                y: 1,
                width: dotSize,
                height: dotSize
            )
            let dot = NSBezierPath(ovalIn: dotRect)

            statusColor.setFill()
            dot.fill()

            dotStrokeColor.setStroke()
            dot.lineWidth = 0.5
            dot.stroke()

            return true
        }
        image.isTemplate = false
        return image
    }
}
