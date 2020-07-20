import * as React from "react";
import * as ReactDOM from "react-dom";
import { DocEditor, DocViewer } from "@ali/yuque";
import "./app.css";

declare let acquireVsCodeApi: any;
declare let initInputValue: any;

enum Mode {
  read,
  edit,
}

const useVscodeEvent = (handler: any) => {
  React.useEffect(() => {
    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  }, [handler]);
};

const vscode = acquireVsCodeApi();

const Editor = () => {
  const [docId, setDocId] = React.useState(null);
  const [mode, setMode] = React.useState(Mode.read);
  const editor = React.useRef(null) as any;
  const previewEditor = React.useRef(null) as any;
  const lang = "zh-cn";
  const [initValue, setValue] = React.useState(initInputValue);
  const [isLoading, setLoading] = React.useState(true);
  const token =
    "at:47864:4740357294853:2058IVjNViztD9agVcxY1Q==:KQ3AQcytor7yyWiaFKMwn2Ry5Kgv5tieteUH0Qkb9efEH/28usUadirY83GY68Jw";

  useVscodeEvent((event: any) => {
    const messsage = event.data;

    if (messsage.type === "update") {
      setValue(messsage.text);
    }
  });
  const editBtn = <button onClick={() => setMode(Mode.edit)}>编辑</button>;
  const updateBtn = (
    <button
      onClick={() => {
        editor.current.getValue().then((value: any) => {
          vscode.postMessage({
            type: "save",
            text: value.lake,
          });
          setMode(Mode.read);
          previewEditor.current.setValue(value.lake);
          editor.current.publish();
        });
      }}
    >
      更新
    </button>
  );

  return (
    <div className="yuque-editor">
      <div className="operators">
        {mode === Mode.read ? editBtn : updateBtn}
      </div>
      <div
        className={
          mode === Mode.read ? "read editor-container" : "editor-container"
        }
      >
        {isLoading ? <div className="editor-loading">loading...</div> : null}
        <div
          key="view"
          className="view editor"
          style={{ display: mode === Mode.read ? "block" : "none" }}
        >
          <DocViewer
            space="test2222"
            initValue={initValue}
            token={token}
            width="100%"
            height="400px"
            pageMinWidth={400}
            autoHeight={true}
            showOutline={true}
            showSkeleton={false}
            viewport={"adapt"}
            language={lang}
            useBucUser={true}
            onLoad={(_editor: any) => {
              previewEditor.current = _editor;
              setLoading(false);
            }}
          />
        </div>
        <div
          key="edit"
          className="edit editor"
          style={{ display: mode === Mode.read ? "none" : "block" }}
        >
          <DocEditor
            space="test2222"
            token={token}
            initValue={initValue}
            ot={true}
            width="100%"
            height="400px"
            pageMinWidth={400}
            autoHeight={true}
            showOutline={true}
            showSkeleton={false}
            viewport={"adapt"}
            language={lang}
            useBucUser={true}
            onSave={({ data }: any) => {}}
            onSubmit={({ data }: any) => {}}
            onLoad={(_editor: any) => {
              editor.current = _editor;
              setLoading(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<Editor />, document.getElementById("app"));
