import React, { useState, useEffect } from 'react';
import { getRequest } from '../Requests';
import { useErrorMessage } from "./useErrorMessage";
import '../styles/Chefs.css';
import { useNavigate } from 'react-router-dom';
function Chefs(){
 const [chefs, setChefs] = useState([]);
      const [errorCode, setErrorCode] = useState(undefined);
  const errorMessage = useErrorMessage(errorCode);
  const navigate = useNavigate();

  const getChefs = async () => {
      const requestResult = await getRequest(`chefs`);
      if (requestResult.succeeded) {
        const newChefs = requestResult.data;
        setChefs(newChefs);
            setErrorCode(undefined);
      } else {
        setErrorCode(requestResult.status);
      }
      console.log(chefs);
  };
  const openChefPage = (e) => {
    const chefId = e.currentTarget.getAttribute('name');
    navigate(`/chefs/${chefId}`);
  }
useEffect(() => {
  getChefs();
}, []);
  return (
    <div className="chefs-container">
      <h1>Chefs</h1>
       {errorMessage && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          ⚠️ {errorMessage}
        </div>
      )}
      <div className="chefs-list">
        {chefs.length === 0 ? (
          <p className="no-chefs">No chefs found available</p>
        ) : (
          chefs.map((chef) => (
            <div key={chef.chefId} name={chef.chefId} className="chef-card" onClick={openChefPage}>
              <div className="chefs-image" style={{ backgroundImage: `url(${chef.imageURL})` }}>
                <div className="chef-overlay">
                  <h2>{chef.userName}</h2>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default Chefs;