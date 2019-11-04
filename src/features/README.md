# visualize-it features

The **visualize-it** application is composed of the following **features**:

 - [**konvaSandbox**](konvaSandbox/README.md): an early sandbox to play with konva.js
 - [**common**](common/README.md): a collection of **app-neutral** features
   - [**baseUI**](common/baseUI/README.md): provides a **UI Foundation** for the entire application _(in an **app neutral** way)_, including: **Responsive Design**, **UI Theme**, **Notify** utility activation, **Left Nav** menu items, **User Menu**, **Current View** state, and **Tool Bars**
   - [**auth**](common/auth/README.md): promotes complete user authentication
     - [**authService**](common/auth/subFeatures/authService/README.md): a persistent authentication service (retaining active user)
       - [**authServiceFirebase**](common/auth/subFeatures/authServiceFirebase/AuthServiceFirebase.js): the **real** AuthServiceAPI derivation based on Firebase
       - [**authServiceMock**](common/auth/subFeatures/authServiceMock/AuthServiceMock.js):             the **mock** AuthServiceAPI derivation
   - [**initFirebase**](common/initFirebase/README.md): initializes the Google Firebase service when WIFI is enabled
   - [**pwa**](common/pwa/README.md): orchestrates the Progressive Web App hooks (as defined by Create React App).
   - [**diagnostic**](common/diagnostic/README.md): a collection of **diagnostic-related** features
     - [**logActions**](common/diagnostic/logActions/README.md): logs all dispatched actions and resulting state
