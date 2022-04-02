/* eslint-env node */
module.exports = {
  content: [],
  darkMode: "class",
  theme: {
    colors: {
      // these names are starting to be terrible
      // consider moving to a numeric scale
      white: "#FFFFFF",
      "off-white": "#F6F6F6",
      "offish-white": "#ECECEC",
      "lighter-grey": "#EBE8E8",
      "light-grey": "#BBBBBB",
      "medium-grey": "#757575",
      "heavy-grey": "#404040",
      "darkish-grey": "#272727",
      "dark-grey": "#171717",
      "darker-grey": "#1E1E1E",
      "off-black": "#010101",
      black: "#000000",
      red: "#B4000B",
      blue: "#3F9CF2",
      "dark-blue": "#002E59",
      green: "#00B41C",
    },
    fontWeight: {
      regular: 300,
      medium: 400,
      bold: 700,
    },
    extend: {
      fontFamily: {
        "lab-grotesque": ["LabGrotesque", "sans-serif"],
      },
      // these sizes are work-in-progress
      // once we have all of them sorted we should probably override the default ones
      fontSize: {
        tiny: ["0.625rem", { lineHeight: "0.75rem", letterSpacing: "0.12rem" }],
        normal: ["1.25rem", { lineHeight: "1.5rem" }],
        medium: ["1.5rem", { lineHeight: "2rem" }],
        large: ["2rem", { lineHeight: "2.375rem" }],
      },
    },
  },
  plugins: [],
};
