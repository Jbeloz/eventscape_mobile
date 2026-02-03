import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Theme } from "../../constants/theme";

interface Door {
  id: number;
  type: string;
  width: string;
  height: string;
  offsetFromCorner: string;
  swingDirection: string;
  hingePosition: string;
  wall: string;
}

interface VenueFloorPlanVisualizerProps {
  length: string;
  width: string;
  doors: Door[];
}

const VenueFloorPlanVisualizer = ({ length, width, doors }: VenueFloorPlanVisualizerProps) => {
  // Parse dimensions
  const lengthNum = parseFloat(length) || 0;
  const widthNum = parseFloat(width) || 0;

  // Canvas constants
  const maxWidth = 220;
  const maxHeight = 180;
  const padding = 40;

  // Calculate aspect ratio and scale
  const aspectRatio = widthNum / lengthNum;
  let canvasWidth: number;
  let canvasHeight: number;

  if (aspectRatio > 1) {
    canvasWidth = maxWidth;
    canvasHeight = maxWidth / aspectRatio;
  } else {
    canvasHeight = maxHeight;
    canvasWidth = maxHeight * aspectRatio;
  }

  // Scale factors
  const scaleX = canvasWidth / lengthNum;
  const scaleY = canvasHeight / widthNum;

  // Render doors
  const renderDoors = () => {
    console.log("🚪 Total doors:", doors.length);
    doors.forEach((door, index) => {
      console.log(`Door ${index + 1}:`, {
        id: door.id,
        width: door.width,
        wall: door.wall,
        offsetFromCorner: door.offsetFromCorner,
        willDisplay: !!(door.width && door.wall && door.offsetFromCorner),
      });
    });
    
    return doors
      .filter((door) => door.width && door.wall && door.offsetFromCorner)
      .map((door) => {
        const doorWidthNum = parseFloat(door.width) || 0;
        const offsetNum = parseFloat(door.offsetFromCorner) || 0;
        let position: any = { position: "absolute" };

        if (door.wall === "Top") {
          // Calculate position from left edge
          const canvasOffsetX = offsetNum * scaleX;
          position.top = -8;
          position.left = canvasOffsetX;
        } else if (door.wall === "Bottom") {
          // Calculate position from left edge
          const canvasOffsetX = offsetNum * scaleX;
          position.bottom = -8;
          position.left = canvasOffsetX;
        } else if (door.wall === "Left") {
          // Calculate position from top edge
          const canvasOffsetY = offsetNum * scaleY;
          position.left = -8;
          position.top = canvasOffsetY;
        } else if (door.wall === "Right") {
          // Calculate position from top edge
          const canvasOffsetY = offsetNum * scaleY;
          position.right = -8;
          position.top = canvasOffsetY;
        }

        return (
          <View
            key={door.id}
            style={[
              styles.doorIcon,
              position,
            ]}
          >
            <Ionicons name="accessibility" size={12} color="#FFFFFF" />
          </View>
        );
      });
  };

  if (lengthNum <= 0 || widthNum <= 0) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Enter length and width to visualize floor plan</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gridBackground}>
        {/* Grid dots background */}
        {Array.from({ length: 100 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.gridDot,
              {
                left: `${(index % 10) * 10}%`,
                top: `${Math.floor(index / 10) * 10}%`,
              },
            ]}
          />
        ))}
      </View>
      
      <View style={styles.floorPlanContainer}>
        <View
          style={[
            styles.floorPlan,
            {
              width: canvasWidth,
              height: canvasHeight,
            },
          ]}
        >
          {/* Grid pattern */}
          <View style={styles.gridPattern} />

          {/* Top dimension label */}
          <View style={styles.dimensionLabelTop}>
            <Text style={styles.dimensionText}>{lengthNum}m</Text>
          </View>

          {/* Left dimension label */}
          <View style={styles.dimensionLabelLeft}>
            <Text style={styles.dimensionText}>{widthNum}m</Text>
          </View>

          {/* Center area label */}
          <View style={styles.areaLabel}>
            <Text style={styles.areaText}>{(lengthNum * widthNum).toFixed(2)} m²</Text>
          </View>

          {/* Doors */}
          {renderDoors()}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { borderColor: Theme.colors.primary, borderWidth: 2 }]} />
          <Text style={styles.legendText}>Venue</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Theme.colors.primary }]} />
          <Text style={styles.legendText}>Door</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "visible",
  },
  gridBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  gridDot: {
    position: "absolute",
    width: 2,
    height: 2,
    backgroundColor: "#E0E0E0",
    borderRadius: 1,
  },
  floorPlanContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "visible",
    paddingHorizontal: 15,
    paddingVertical: 12,
    zIndex: 1,
  },
  floorPlan: {
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: Theme.colors.primary,
    borderRadius: 6,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  gridPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#F9F9F9",
    opacity: 0.5,
    borderRadius: 3,
  },
  dimensionLabelTop: {
    position: "absolute",
    top: -28,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dimensionLabelLeft: {
    position: "absolute",
    left: -35,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  dimensionText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 13,
    color: Theme.colors.text,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
  },
  areaLabel: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  areaText: {
    fontFamily: Theme.fonts.semibold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  doorIcon: {
    position: "absolute",
    width: 24,
    height: 24,
    backgroundColor: Theme.colors.primary,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  placeholderContainer: {
    width: "100%",
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  placeholderText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: Theme.fonts.regular,
    fontSize: 12,
    color: Theme.colors.text,
  },
});

export default VenueFloorPlanVisualizer;
