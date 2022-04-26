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
    extend: {
      fontFamily: {
        "lab-grotesque": ["Lab Grotesque", "sans-serif"],
      },
      // these sizes are work-in-progress
      // once we have all of them sorted we should probably override the default ones
      fontSize: {
        label: ["0.625rem", { lineHeight: "2rem", letterSpacing: "0.15em" }],
        t0: ["1.25rem", { lineHeight: "1.5rem" }],
        t1: ["1.5rem", { lineHeight: "2rem" }],
        t2: ["2rem", { lineHeight: "2.375rem" }],
      },
      flex: {
        'zz-half': '0 0 50%',
      },
      keyframes: {
        'busy-status': {
          from: { backgroundColor: '#FF9900' },
          to: { backgroundColor: 'currentColor' }
        },
      },
      animation: {
        'busy-status': 'busy-status 500ms steps(2, jump-none) infinite alternate',
      },
    },
  },
  plugins: [],
};
