// ChoicePopup.jsx contiene il popup che chiede all'utente se secondo lui ha parlato con un bot o no

function ChoicePopup({ handleChoicePopupResponse }) {

  return (

    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-green-300 mb-4">
                La chat è terminata!
            </h1>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-green-300 mb-4">
                Secondo te, hai parlato con un intelligenza artificiale?
            </h2>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => handleChoicePopupResponse(true)}
                    className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-lg"
                >
                    Si
                </button>
                <button
                    onClick={() => handleChoicePopupResponse(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    No
                </button>
            </div>
        </div>
    </div>
  );
}

export default ChoicePopup;