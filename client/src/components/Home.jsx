import Footer from "./Footer";

function Home(){
const currentUser = JSON.parse(localStorage.getItem("CurrentUser"));
console.lo
  return (
    <div>
      <img
        src="/images/plan&plate.png"
        alt="Home Image"
        style={{ width: "40%", height: "auto", marginLeft: "25%" }}
      />
      {currentUser&&currentUser.userType=="Regular" && <Footer />}
    </div>
  );
}
export default Home;