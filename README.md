# **GoVis - Installation Guide**

GoVis is a mobile application designed to enhance the fishing experience for sport anglers across the Netherlands. GoVis provides essential tools to help you find the best spots,
understand local regulations, track your catches, and connect with the angling community.

## **✨ Key Features**

- **Fishing Spots Map**: Explore an interactive map showing legal fishing locations, including private, public, and
  restricted areas, all based on your fishing license type.

- **Detailed Water Information**: Tap on any body of water to access crucial details:

* Prevalent fish species

* Night fishing allowances

* Requirements for additional permits

* Specific local regulations and notes

- **Catch Registration**: Easily log your catches by uploading photos or manually entering details like species, size,
  weight, and location. Organize and filter your catch history by species, size, or date.

- **Community Hub**: Stay informed about local fishing events and competitions. Join activities or, if you're an
  organizer, sell tickets directly within the app.

- **Sustainable Fishing Tips**: Access valuable advice on sustainable fishing methods tailored to different fish
  species, promoting responsible angling and aquatic conservation.

## **🚀 Getting Started**

Follow these steps to get GoVis up and running on your local machine using Expo.

### **Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js**: The latest [LTS version](https://nodejs.org/en/download/) is recommended.

- **npm**: This comes bundled with Node.js.

- **Expo CLI**: Install it globally via npm:\
  npm install -g expo-cli\
  \
  _Alternatively, you can use npx without a global install for most commands._

- **Expo Go App**: Download the [Expo Go app](https://expo.dev/client) on your smartphone (available on the App Store
  for iOS and Google Play for Android). This app allows you to test GoVis directly on your device.

### **Installation Steps**

1. **Clone the Repository:**\
   Open your terminal or command prompt and clone the GoVis repository:\
   git clone https\://github.com/WesleyNederpel/TLE2-Team9.git

2. **Navigate to the Project Directory:**\
   Change into the newly cloned project folder:\
   cd TLE2-Team9

3. **Install Dependencies:**\
   Install all required project dependencies using npm:\
   npm install

4. **Start the Expo Development Server:**\
   Launch the Expo server to run the app:\
   npx expo start\
   _This command will open a new browser tab displaying a **QR code**._

5. **Scan and Run:**\
   Open the Expo Go app on your smartphone and scan the QR code displayed in your browser. The GoVis app will then load
   on your device, ready for you to explore!

## **💡 Future Enhancements**

While GoVis offers a robust set of features, there are many exciting possibilities for future development:

- **User Authentication & Profiles**: Implement user accounts to allow anglers to save their catches in the cloud and
  access personalized data.

- **Social Features**: Introduce capabilities for users to share their catches, follow friends, and compete on
  leaderboards.

- **Push Notifications**: Send timely reminders for upcoming events, permit renewals, or important regulation changes.

- **Real-time Data Integration**: Integrate live weather and water quality data for fishing spots to help users plan
  their trips better.

- **Advanced Event Management**: Expand the community tab with more comprehensive tools for creating, managing, and
  promoting fishing events.
