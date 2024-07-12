import React from "react";

const NotifyComponent = () => {
  return (
    <div className="toast toast-top toast-center">
      <div className="alert alert-info">
        <span className="font-bold">New Fastest Lap has been set</span>
      </div>
      <span className="text-base text-gray-500">
        New Fastest Lap has been set
      </span>
    </div>
  );
};

export default NotifyComponent;
