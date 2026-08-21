import { ProgressSpinner } from "primereact/progressspinner";

const LoadSpinner = ({
  width = "35px",
  height = "35px",
  strokeWidth = "8",
  fill = "var(--surface-ground)",
  animationDuration = ".5s",
  centered = false,
}) => {
  const containerStyle = centered
    ? {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        width: "100%",
        height: "100%",
      }
    : {};

  return (
    <div style={containerStyle}>
      <ProgressSpinner
        style={{ width, height }}
        strokeWidth={strokeWidth}
        fill={fill}
        animationDuration={animationDuration}
      />
    </div>
  );
};

export default LoadSpinner;
