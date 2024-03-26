import React, { useState, useEffect } from "react";
import "./App.css";
import Status from "./status/Status";
import Container from "./container/Container";
import Connection from "./connection/Connection";
import packageInfo from "../../../package.json";
import Api from "../../services/api";
import Page from "../../services/page";
import { compareVersions } from "compare-versions";

const App = () => {
  const api = new Api();
  const page = new Page();

  const [state, setState] = useState({
    apiVersion: null,
    version: packageInfo.version,
    minApiVersion: "3.0.0",
    contexts: {},
    supported: false,
    notFound: true,
  });

  const onChange = (type, name, key, value) => {
    if (type === "context") {
      setState((prevState) => ({
        ...prevState,
        contexts: {
          ...prevState.contexts,
          [name]: { ...prevState.contexts[name], [key]: value },
        },
      }));
    }
  };

  const onConnectionChange = async (host, port) => {
    api.host = host;
    api.port = port;

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("host", host);
    currentUrl.searchParams.set("port", port);
    window.history.pushState({}, "", currentUrl.href);

    try {
      await getMeta();
      await getContexts();
    } catch (err) {
      console.log(err);
      setState((prevState) => ({
        ...prevState,
        apiVersion: null,
        contexts: {},
        supported: false,
      }));
    }
  };

  const onSave = async (type, name) => {
    if (type === "context") {
      await api.setContext(name, state.contexts[name]);
    }
    page.reload();
  };

  const getMeta = async () => {
    const { version, enabled } = await api.getMeta();

    const min = state.minApiVersion.replace(/-[(beta)(alpha)].*/, "");
    let curr = version;

    if (version) {
      curr = version.replace(/-[(beta)(alpha)].*/, "");
    }

    const supported = compareVersions(curr, min) > -1;

    setState((prevState) => ({
      ...prevState,
      enabled,
      apiVersion: curr,
      supported,
      notFound: !Boolean(version),
    }));
  };

  const getContexts = async () => {
    if (state.apiVersion) {
      let contexts = {};
      for (const context of await api.getContexts()) {
        contexts[context.name] = context.context;
      }

      setState((prevState) => ({
        ...prevState,
        contexts,
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getMeta();
        await getContexts();
      } catch (err) {
        console.log(err);
        setState((prevState) => ({
          ...prevState,
          apiVersion: null,
          contexts: {},
          supported: false,
        }));
      }
    };

    fetchData();

    page.onChange(() => {
      fetchData();
    });
  }, []);

  return (
    <div className="App">
      <div className="card">
        <div className="card-header row">
          <div className="col-sm-auto">
            <Status
              supported={state.supported}
              notFound={state.notFound}
              clientVersion={state.version}
              apiVersion={state.apiVersion}
              apiMinVersion={state.minApiVersion}
              apiMaxVersion={state.maxApiVersion}
            />
            <Connection
              host={api.host}
              port={api.port}
              onChange={onConnectionChange}
            />
          </div>
        </div>
      </div>
      {state.supported && (
        <Container data={state.contexts} onChange={onChange} onSave={onSave} />
      )}
    </div>
  );
};

export default App;
