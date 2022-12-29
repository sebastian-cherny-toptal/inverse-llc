'use strict';
const e = React.createElement;


function App() {
  const [allColections, setAllColections] = React.useState([]);
  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [showModal, setShowModal] = React.useState(false);
  const [modalDescription, setModalDescription] = React.useState("");
  const [spreadsheetId, setSpreadsheetId] = React.useState(null);
  const [error, setError] = React.useState("");
  const [collectionName, setCollectionName] = React.useState("");
  const [fileLoaded, setFileLoaded] = React.useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = React.useState(false);
  const [sharedWithEmails, setSharedWithEmails] = React.useState([]);
  const [newEmailToShare, setNewEmailToShare] = React.useState([]);

  const success = (data) => {
    //setAllColections(data.data);
  };

  const getData = () => {
    //getLoggedInUsername((username) => { setLoggedInUsername(username) });
    //getPageLanguage((lang => { setPageLanguage(lang); }));
    //get_all_collections_api(success, (text) => { console.log("Error: ", text) });
  };
  React.useEffect(() => {
    getData();
  }, []);

  let collapsedParagraphs = {};
  var lyricsEditor = document.getElementById('lyricsEditor');
  var lineCounter = document.getElementById('lineCounter');
  var arrowsDiv = document.getElementById('arrowsDiv');

  const line_counter = () => {
    const textLines = lyricsEditor.value.split('\n');
    var lineCount = textLines.length;
    var lineCounterLines = [];
    var paragraphCount = 1;
    for (const btn of arrowsDiv.querySelectorAll('button')) {
      btn.remove();
    }
    for (const br of arrowsDiv.querySelectorAll('br')) {
      br.remove();
    }
    for (var x = 0; x < lineCount; x++) {
      if ((x === 0 && textLines[x] !== '') ||
        (x > 0 && textLines[x - 1].trim() === '' && textLines[x].trim() !== '') ||
        (x === textLines.length - 1 && textLines[x].trim() === '' && x > 0 && textLines[x - 1].trim() === '')) {
        lineCounterLines.push(paragraphCount + '.');
        arrowsDiv.appendChild(getDownArrowButton(paragraphCount));
        paragraphCount += 1;
      } else {
        lineCounterLines.push('');
        arrowsDiv.appendChild(document.createElement('br'));
        arrowsDiv.appendChild(document.createElement('span'));
      }
    }
    lineCounter.value = lineCounterLines.join('\n');
    //lineCountCache = lineCount;
  }

  const getParagraphText = (paragraphNum) => {
    const textLines = lyricsEditor.value.split('\n');
    var lineCount = textLines.length;
    var paragraphCount = 1;
    var paragraphLines = [];
    for (var x = 0; x < lineCount; x++) {
      if ((x === 0 && textLines[x] !== '') ||
        (x > 0 && textLines[x - 1].trim() === '' && textLines[x].trim() !== '') ||
        (x === textLines.length - 1 && textLines[x].trim() === '' && x > 0 && textLines[x - 1].trim() === '')) {
        if (paragraphCount === paragraphNum) {
          paragraphLines.push(textLines[x]);
        }
        paragraphCount += 1;
      } else {
        if (paragraphCount - 1 === paragraphNum) {
          paragraphLines.push(textLines[x]);
        }
      }
    }
    return paragraphLines.join('\n');
  }

  const setTextInParagraph = (paragraphNum, textToAppend) => {
    const textLines = lyricsEditor.value.split('\n');
    var lineCount = textLines.length;
    var paragraphCount = 1;
    var allLines = [];
    for (var x = 0; x < lineCount; x++) {
      if ((x === 0 && textLines[x] !== '') ||
        (x > 0 && textLines[x - 1].trim() === '' && textLines[x].trim() !== '') ||
        (x === textLines.length - 1 && textLines[x].trim() === '' && x > 0 && textLines[x - 1].trim() === '')) {
        if (paragraphCount === paragraphNum) {
          for (const parLine of textToAppend.split('\n')) {
            allLines.push(parLine);
          }
        } else {
          allLines.push(textLines[x]);
        }
        paragraphCount += 1;
      } else {
        if (paragraphNum !== paragraphCount - 1) {
          allLines.push(textLines[x]);
        }
      }
    }
    lyricsEditor.value = allLines.join('\n');
    line_counter();
  }

  const getDownArrowButton = (paragraphNum) => {
    const btn = document.createElement('button');
    btn.textContent = '^';
    btn.style.marginTop = '10px';
    btn.style.color = '#ffffff';
    btn.style.backgroundColor = '#000000';
    const this_btn_id = 'arrow_btn_' + paragraphNum;
    btn.id = this_btn_id;
    btn.onclick = () => {
      if (collapsedParagraphs[paragraphNum] == null) {
        collapsedParagraphs[paragraphNum] = getParagraphText(paragraphNum);
        setTextInParagraph(paragraphNum, collapsedParagraphs[paragraphNum].split('\n')[0] + '\n');
        document.getElementById(this_btn_id).textContent = 'v';
      } else {
        setTextInParagraph(paragraphNum, collapsedParagraphs[paragraphNum]);
        collapsedParagraphs[paragraphNum] = null;
        document.getElementById(this_btn_id).textContent = '^';
      }
    }
    return btn;
  }


  if (lyricsEditor != null && lineCounter != null) {
    lyricsEditor.addEventListener('scroll', () => {
      lineCounter.scrollTop = lyricsEditor.scrollTop;
      lineCounter.scrollLeft = lyricsEditor.scrollLeft;

      arrowsDiv.scrollTop = lyricsEditor.scrollTop;
      arrowsDiv.scrollLeft = lyricsEditor.scrollLeft;
    });


    lyricsEditor.addEventListener('keydown', (e) => {
      let { keyCode } = e;
      let { value, selectionStart, selectionEnd } = lyricsEditor;
      if (keyCode === 9) {  // TAB = 9
        //e.preventDefault();
        //lyricsEditor.value = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd);
        //lyricsEditor.setSelectionRange(selectionStart + 2, selectionStart + 2)
      }
    });

    lyricsEditor.addEventListener('input', () => {
      line_counter();
    });
  }


  return (
    <div>
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em", borderRadius: "1%", border: "1px solid"
      }}>
        <div>
          <button className="btn btn-primary" onClick={() => { }}
            style={{ marginBottom: "1em", backgroundColor: "#000000", borderColor: "#000000" }}>Save lyrics</button>
        </div>

      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
