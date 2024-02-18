import React, { useEffect, useState } from "react";
import { UPLOADER_URL } from "../utils/base";
import Toast from "./Toast";

export default function Form() {
  const [url, setUrl] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [id, setId] = useState("");
  const [deployed, setDeployed] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    console.log(url);
    setLoading(true);

    let uploadRes = await fetch(`${UPLOADER_URL}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repoURL: url,
      }),
    });

    uploadRes = await uploadRes.json();
    console.log(uploadRes);
    console.log(uploadRes.id);

    if (!uploadRes.id) {
      alert("Something went wrong");
      return;
    }

    const newId = uploadRes.id;

    setId(newId);
    console.log(newId);
    setShowToast(true);

    const interval = setInterval(async () => {
      console.log("Checking...");
      let statusRes = await fetch(`${UPLOADER_URL}/status?id=${newId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      statusRes = await statusRes.json();
      console.log(statusRes);
      const updatedStatus = statusRes.status;
      setStatus(updatedStatus);

      if (updatedStatus === "deployed") {
        clearInterval(interval);
        setDeployed(true);
        setDeployedUrl(`${newId}.vrcl.com/index.html`);
        setLoading(false);
      }
    }, 3000);
  }

  useEffect(() => {
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  }, [showToast]);

  return (
    <>
      {id !== "" && showToast ? (
        <Toast message={"Project uploaded! Deploying now..."} />
      ) : null}
      {deployed && showToast ? <Toast message={"Project deployed!"} /> : null}
      <div className="bg-neutral p-20 rounded border flex justify-center items-center flex-col">
        <p className="mb-5 text-xl">GitHub Repository</p>
        <div>
          <input
            type="text"
            placeholder="https://github.com/your/project"
            className="input input-bordered input-md w-full max-w-lg"
            onChange={(e) => setUrl(e.target.value)}
          />

          {loading ? (
            <>
              <button
                className="btn btn-accent mt-8 rounded text-white"
                onClick={async () => await handleSubmit()}
                disabled={true}
              >
                Deploying...
            <span className="loading loading-spinner loading-xs"></span>
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-accent mt-8 rounded text-white"
                onClick={async () => await handleSubmit()}
              >
                Deploy
              </button>
            </>
          )}
        </div>
      </div>

      {deployed ? (
        <div className="bg-neutral p-5 mt-5 rounded border">
          <p className="text-lg">Deployed at {deployedUrl}</p>
        </div>
      ) : null}
    </>
  );
}
