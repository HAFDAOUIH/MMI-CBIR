import React from "react";
import Modal from "react-modal";


// Custom styles for the modal
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
    },
};

function ProgressBar({ isLoading }) {
    return (
        <Modal isOpen={isLoading} style={customStyles} contentLabel="Feedback Progress">
            <div>
                <h3>Processing Feedback...</h3>
                <div className="spinner"></div>
            </div>
        </Modal>
    );
}

export default ProgressBar;
