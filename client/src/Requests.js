export async function getRequest(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return { succeeded: true, data };
  } catch (error) {
    console.error("Error in getRequest:", error);
    return { succeeded: false, error: error.message || "Unknown error" };
  }
}
