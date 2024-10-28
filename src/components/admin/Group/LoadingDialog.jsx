// LoadingDialog.js
import React from "react";
import PropTypes from "prop-types";

const LoadingDialog = ({ isOpen }) => {
  if (!isOpen) return null; // Don't render anything if not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading groups...</p>
      </div>
    </div>
  );
};

LoadingDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default LoadingDialog;
