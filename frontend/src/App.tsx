import React from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";

function App() {
  return (
    <HashRouter>
      <Switch>
        <Route path="/products" exact>
          <div>TODO should be replaced to products list page</div>
        </Route>
        <Route path="/products/:productId">
          <div>TODO should be replaced to product detail page</div>
        </Route>
        <Route>
          <Redirect to="/products" />
        </Route>
      </Switch>
    </HashRouter>
  );
}

export default App;
