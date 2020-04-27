// babel needed for jest unit tests :-(
// ... Svelte has it's own ES6 mechanism :-)
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current"
        }
      }
    ]
  ]
};
