// various featureFlags used throughout the application
export default {

  // should app use WIFI?
  // ... regulates various services (real/mocked)
  useWIFI: true,

  // should app emit diagnostic logs?
  //  - false:     no logs
  //  - true:      generate 'non verbose' logs (e.g. actions will NOT include redux state)
  //  - 'verbose': generate 'verbose'     logs (e.g. actions WILL     include redux state)
  log:     false,

  // should app enable diagnostic sandbox controls?
  sandbox: false,
};
