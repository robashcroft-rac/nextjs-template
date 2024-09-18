import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import RacIcon from "./RacIcon";

test("renders RacIcon component", () => {
  const { getByAltText } = render(<RacIcon />);
  const imgElement = getByAltText("RAC Logo");
  expect(imgElement).toBeInTheDocument();
  expect(imgElement).toHaveAttribute("src", "/apple-touch-icon-114x114.png");
});
