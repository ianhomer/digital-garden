import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";

export const defaultDepth = () => {
  if (typeof window !== "undefined") {
    const savedDepth = JSON.parse(localStorage.getItem("graph-depth"));
    if (savedDepth) {
      return savedDepth;
    }
  }
  return 2;
};

export default ({ value, setValue }) => {
  useEffect(() => {
    localStorage.setItem("graph-depth", JSON.stringify(value));
  }, [value]);

  const handleDepthChange = (event: any, newValue: number | number[]) => {
    setValue(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  return (
    <Box
      id="depth-slider-box"
      sx={{ padding: "0.4em", width: 100, border: "1px dashed grey" }}
    >
      <Typography id="depth-label">Depth</Typography>
      <Slider
        defaultValue={value}
        onChange={handleDepthChange}
        aria-labelledby="depth-slider"
        min={1}
        max={4}
        step={1}
        size="small"
        marks
        valueLabelDisplay="auto"
      />
    </Box>
  );
};
