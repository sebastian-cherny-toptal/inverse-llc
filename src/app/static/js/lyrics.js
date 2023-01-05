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

  var allParagraphs = [];
  var allDisplayedLength = 0;
  var allEvents = [];
  var lyricsEditor = document.getElementById('lyricsEditor');
  var lineCounter = document.getElementById('lineCounter');
  var arrowsDiv = document.getElementById('arrowsDiv');

  const getFirstLine = (t) => {
    return t.split('\n')[0];
  }

  const getLengthDisplayed = (p) => {
    return p[1] ? getFirstLine(p[0]).length : p[0].length;
  }

  const setCompleteTextFromParagraphs = () => {
    var paragraphsToDisplay = [];
    for (var i = 0; i < allParagraphs.length; i++) {
      const p = allParagraphs[i];
      var txt = p[1] ? getFirstLine(p[0]) : p[0];
      // removing last \n
      if (txt[txt.length - 1] === '\n' && i < allParagraphs.length - 1) {
        if (i === 0 && txt === '\n') {
        } else {
          txt = txt.substring(0, txt.length - 1)
        }
      }
      paragraphsToDisplay.push(txt);
    }
    lyricsEditor.value = paragraphsToDisplay.join('\n');
  }

  const getParagraphIndexAndCharsBefore = (charPosition) => {
    var charsPassed = 0;
    for (var i = 0; i < allParagraphs.length; i++) {
      const p = allParagraphs[i];
      const nextPassed = charsPassed + getLengthDisplayed(p);
      if (nextPassed > charPosition) {
        return [i, charsPassed];
      }
      charsPassed = nextPassed;
    }
    return [allParagraphs.length, charsPassed];
  }

  // Invariant: each paragraph text is text with no two \n consecutive, except at the end that may have many \n together

  /* Text will be conformed by:
      Paragraphs:
        * Type: May be counted or skipped in enumeration
        * Collapsed: May be showing one line or whole text
        * Displayed length
        * TEXT
          * May start with any character (ONLY 1st paragraph may start with \n)
          * Every paragraph end with two consecutive \n
      Concatenation of every paragraph in order gives displayed text in lyricsEditor
    
  Functions needed:
    + getLengthDisplayed
    + getTextFromParagraphs
    + getParagraphsFromText
    + getParagraphIndexAndPositionInParagraph
    + 

  Adding char:
    * At the beginning:
      * Enter:
        * Before an enter, create empty first paragraph
        * Before non-enter, add \n to first paragraph
      * Non-enter:
        * Before enter and non-enter (or 1st paragraph starts with \n): Add as first character of 1st paragraph
        * Else, just add at beginning of 1st paragraph
    * At the end:
      * After text or exactly one enter: Just add
      * If after two or more enters:
        * non-enter: new paragraph
        * enter: append to last paragraph
    * If NON ENTER:
      + After non-enter or before non-enter, just add it.
      * After 1 enter:
        * Before 1 enter: merge paragraphs
        * Before 2 (or more) enters: just add
      * After 2 (or more) enters:
        * Before 1 enter: Add it at beginning of next paragraph
        * Before 2 (or more) enters: Create new paragraph (moving following enters to this one instead of previous one)
    * If ENTER:
      * After non-enter: Just add
      * After exactly 1 enter:
        * Before non-enter: Split paragraph in two
        * Before 1 or more enters: Just add to paragraph
      * After 2 or more enters: Just add

  
      */

  const processEvent = (ev) => {
    if (ev[0] === 'typing') {
      // typing ONE character
      if (allParagraphs.length > 0) {
        if (ev[1] === allDisplayedLength) { // Typed at the end
          const txtLastParagraph = allParagraphs[allParagraphs.length - 1][0];
          if (txtLastParagraph[txtLastParagraph.length - 1] === '\n' &&
            (txtLastParagraph.length > 2 && txtLastParagraph[txtLastParagraph.length - 2] === '\n') &&
            ev[2] !== '\n') { // Starting new paragraph at the end
            allParagraphs.push(getUncollapsedParagraphFromText(ev[2]));
          } else { // Adding character at then of last paragraph
            allParagraphs[allParagraphs.length - 1][0] = allParagraphs[allParagraphs.length - 1][0] + ev[2];
            console.log('append char to last par')
          }
        } else if (ev[1] === 0) { // Typed at the beginning
          if (ev[2] === '\n' && allParagraphs[0][0][0] === '\n') {
            var newParagraphs = [getUncollapsedParagraphFromText('\n')].concat([...allParagraphs]);
            newParagraphs[1][0] = newParagraphs[1][0].substring(1);
            allParagraphs = newParagraphs;
          } else {
            allParagraphs[0][0] = ev[2] + allParagraphs[0][0];
          }
        } else {

          // Adding character to non-empty paragra
          const [affectedParagraphIndex, charsPassed] = getParagraphIndexAndCharsBefore(ev[1]);
          // Altering paragraph affectedParagraphIndex
          console.log('affectedParagraphIndex ', affectedParagraphIndex);
          console.log('chars passed ' + charsPassed);
          const p = allParagraphs[affectedParagraphIndex];
          if (p == null) {
            // typed at the end of text
            // either add new paragraph with this char, or just add new char to last paragraph
          } else {

            if (ev[2] === '\n' && ev[1] > 0 && p[0][(ev[1] - charsPassed) - 1] === '\n') {
              var newParagraphs = [];
              newParagraphs = allParagraphs.slice(0, affectedParagraphIndex - 1);
              newParagraphs.push(getUncollapsedParagraphFromText(p[0].substring(0, ev[1] - charsPassed)));
              newParagraphs.push(getUncollapsedParagraphFromText(p[0].substring(ev[1] - charsPassed)));
              newParagraphs.concat([...allParagraphs.slice(affectedParagraphIndex + 1)]);
              allParagraphs = newParagraphs;
            } else {
              console.log(ev[1]);
              console.log(charsPassed);
              console.log(getLengthDisplayed(allParagraphs[affectedParagraphIndex]))
              if (ev[1] - charsPassed === getLengthDisplayed(allParagraphs[affectedParagraphIndex]) - 1 &&
                allParagraphs[affectedParagraphIndex][0][allParagraphs[affectedParagraphIndex][0].length - 1] === '\n' &&
                affectedParagraphIndex < allParagraphs.length - 1) {
                // Merge paragraphs
                var newParagraphs = [];
                if (affectedParagraphIndex) {
                  newParagraphs = allParagraphs.slice(0, affectedParagraphIndex - 1);
                }
                console.log(allParagraphs[affectedParagraphIndex][0])
                console.log(allParagraphs[affectedParagraphIndex + 1][0])
                newParagraphs.push(getUncollapsedParagraphFromText(allParagraphs[affectedParagraphIndex][0] +
                  ev[2] + allParagraphs[affectedParagraphIndex + 1][0]));
                newParagraphs.concat([...allParagraphs.slice(affectedParagraphIndex + 2)]);
                console.log('new paragraphs after merge');
                console.log(newParagraphs);
                allParagraphs = newParagraphs;
              } else {
                var newText = p[0].substring(0, ev[1] - charsPassed) + ev[2] + p[0].substring(ev[1] - charsPassed);
              }
              console.log('text in new paragraph ' + newText);
              allParagraphs[affectedParagraphIndex] = [newText, p[1]];
            }
          }
        }
      } else {
        allParagraphs = [getUncollapsedParagraphFromText(ev[2])];
      }
      allDisplayedLength += 1;
    }
    console.log(allParagraphs);
    setCompleteTextFromParagraphs();
    lyricsEditor.selectionStart = ev[1] + 1;
    lyricsEditor.selectionEnd = ev[1] + 1;
  }


  const setLineNumbersAndButtons = () => {
    for (const btn of arrowsDiv.querySelectorAll('button')) {
      btn.remove();
    }
    for (const br of arrowsDiv.querySelectorAll('br')) {
      br.remove();
    }
    var lineCounterLines = [];
    for (var i = 0; i < allParagraphs.length; i++) {
      const p = allParagraphs[i];
      lineCounterLines.push((i + 1) + '.');
      arrowsDiv.appendChild(getDownArrowButton(i));
      var paragraphLinesCount = p[1] ? 1 : p[0].split('\n').length - 2;
      if (i === 0 && allParagraphs[0][0] === '\n') {
        paragraphLinesCount++;
      }
      for (var asd = 0; asd < paragraphLinesCount; asd++) {
        lineCounterLines.push('');
        arrowsDiv.appendChild(document.createElement('br'));
      }
    }
    lineCounter.value = lineCounterLines.join('\n');
    //lineCountCache = lineCount;
  }

  const getCollapsedParagraphFromText = (t) => {
    return [t, true];
  }

  const getUncollapsedParagraphFromText = (t) => {
    return [t, false];
  }

  const getDownArrowButton = (paragraphNum) => {
    const btn = document.createElement('button');
    btn.textContent = allParagraphs[paragraphNum][1] === false ? '^' : 'v';
    btn.style.marginTop = '18px';
    btn.style.color = '#ffffff';
    btn.style.backgroundColor = '#000000';
    const this_btn_id = 'arrow_btn_' + paragraphNum;
    btn.id = this_btn_id;
    btn.onclick = () => {
      if (allParagraphs[paragraphNum][1] === false) {
        allParagraphs[paragraphNum] = getCollapsedParagraphFromText(allParagraphs[paragraphNum][0]);
        document.getElementById(this_btn_id).textContent = 'v';
      } else {
        allParagraphs[paragraphNum] = getUncollapsedParagraphFromText(allParagraphs[paragraphNum][0]);
        document.getElementById(this_btn_id).textContent = '^';
      }
      setCompleteTextFromParagraphs();
    }
    return btn;
  }

  const getAllParagraphsFromTextValue = (longText) => {
    allDisplayedLength = longText.length;
    if (longText.length === 0) {
      allParagraphs = [getUncollapsedParagraphFromText('')];
      return;
    }
    var newParagraphs = [];
    var lastText = '';
    for (var i = 0; i < longText.length; i++) {
      if (longText[i] !== '\n' && i > 1 && longText[i - 1] === '\n' && longText[i - 2] === '\n') {
        newParagraphs.push(getUncollapsedParagraphFromText(lastText));
        lastText = longText[i];
      } else {
        lastText += longText[i];
      }
    }
    if (lastText.length) {
      newParagraphs.push(getUncollapsedParagraphFromText(lastText));
    }
    allParagraphs = newParagraphs;
  }

  if (lyricsEditor != null && lineCounter != null) {
    lyricsEditor.addEventListener('scroll', () => {
      lineCounter.scrollTop = lyricsEditor.scrollTop;
      lineCounter.scrollLeft = lyricsEditor.scrollLeft;

      arrowsDiv.scrollTop = lyricsEditor.scrollTop;
      arrowsDiv.scrollLeft = lyricsEditor.scrollLeft;
    });


    lyricsEditor.addEventListener('keydown', (e) => {
      var pressedKeyCode = e.keyCode;
      var pressedChar = e.key;
      const isCtrlPressed = e.metaKey || e.ctrlKey;
      let { value, selectionStart, selectionEnd } = lyricsEditor;
      if (pressedKeyCode === 9) {  // TAB = 9
        //e.preventDefault();
        //lyricsEditor.value = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd);
        //lyricsEditor.setSelectionRange(selectionStart + 2, selectionStart + 2)
      }
      var charToAdd = pressedChar;

      if (charToAdd === 'Backspace') {
        e.preventDefault();
        const initialSelectionStart = lyricsEditor.selectionStart;
        const lyricsEditorValue = lyricsEditor.value.substring(0, initialSelectionStart) + lyricsEditor.value.substring(lyricsEditor.selectionEnd);
        lyricsEditor.value = lyricsEditorValue;
        lyricsEditor.selectionStart = initialSelectionStart;
        lyricsEditor.selectionEnd = initialSelectionStart;
        getAllParagraphsFromTextValue(lyricsEditor.value);
      } else {
        if (charToAdd === 'Enter') {
          charToAdd = '\n';
        } else if (charToAdd === 'Tab') {
          charToAdd = '\t';
        }
        var textEvent;
        if (isCtrlPressed) {
        } else {
          if (charToAdd.length === 1) {
            if (selectionStart === selectionEnd) {
              textEvent = ['typing', selectionStart, charToAdd];
            } else {
              textEvent = [];
            }
            e.preventDefault();
            processEvent(textEvent);
            allEvents.push(textEvent);
            setLineNumbersAndButtons();
          } else {
            lyricsEditor.value = e.target.value;
            getAllParagraphsFromTextValue(lyricsEditor.value);
          }
        }
      }
    });

    lyricsEditor.addEventListener('input', () => {
      console.log('INPUTTT')
      setLineNumbersAndButtons();
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
