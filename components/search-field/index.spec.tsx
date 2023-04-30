import React from "react";
import { SearchField } from ".";
import { fireEvent, render, screen, waitFor } from "../../test-utils";

const mockOnChangeText = jest.fn();

const setup = () => {
  render(<SearchField onChangeText={mockOnChangeText} />);
  return { searchField: screen.getByTestId(/search-field/i) };
};

describe("<SearchField />", () => {
  it("should render without error", () => {
    setup();
  });

  it("should debounce user input", async () => {
    const { searchField } = setup();
    fireEvent.changeText(searchField, "h");
    fireEvent.changeText(searchField, "he");
    fireEvent.changeText(searchField, "hel");
    fireEvent.changeText(searchField, "hell");
    fireEvent.changeText(searchField, "hello");
    await waitFor(() => expect(mockOnChangeText).toHaveBeenCalledTimes(1));
    expect(mockOnChangeText).toBeCalledWith("hello");
  });
});
