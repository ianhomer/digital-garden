import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

export default ({ value, setValue }) => {
  const handleDepthChange = (event: any, newValue: number | number[]) => {
    setValue(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  return (
    <Box
      id="depth-slider-box"
      sx={{ padding: "1em", width: 200, border: "1px dashed grey" }}
    >
      <Typography id="depth-label" gutterBottom>
        Graph Depth {value}
      </Typography>
      <Slider
        value={value}
        onChange={handleDepthChange}
        aria-labelledby="depth-slider"
        min={1}
        max={4}
        step={1}
        marks
        valueLabelDisplay="auto"
      />
    </Box>
  );
};
