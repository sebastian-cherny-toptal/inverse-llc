'use strict';
const e = React.createElement;


function App() {

  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);

  var autosaveInterval = null;
  var lyricsId = null;
  const lyricsIdFromUrl = getLyricsId();

  if (lyricsIdFromUrl.length) {
    lyricsId = lyricsIdFromUrl;
  }

  const success = (data) => {
    //setAllColections(data.data);
  };

  //var userHeaderDiv = null;
  React.useEffect(() => {
    getLoggedInUsername((username) => { setLoggedInUsername(username); });
    get_user_data_api((data) => {
      setUserInfo(data.data);
      //userHeaderDiv.render();
    });
  }, []);
  //getPageLanguage((lang => { setPageLanguage(lang); }));
  //get_all_collections_api(success, (text) => { console.log("Error: ", text) });


  var allParagraphs = [];
  var allEvents = [];
  var lyricsEditor = document.getElementById('lyricsEditor');
  var leftLineCounter = document.getElementById('leftLineCounter');
  var rightLineCounter = document.getElementById('rightLineCounter');
  var arrowsDiv = document.getElementById('arrowsDiv');


  const createParagraphObjectFromText = (text) => {
    return {
      'text': text,
      'lengthDisplayed': text.length,
      'isCollapsed': false,
      'isCounted': true,
    }
  }

  const getTextDisplayed = (paragraph) => { // With all the ending \n
    if (paragraph.isCollapsed) {
      // Don't allow collapsed first paragraph to have enter at the beginning
      console.log('is collapsed!')
      return paragraph.text.split('\n')[0] + '\n\n';
    } else {
      return paragraph.text;
    }
  }

  const getLengthDisplayed = (paragraph) => {
    return getTextDisplayed(paragraph).length;
    // return paragraph.lengthDisplayed;
  }

  const getTotalLengthDisplayed = () => {
    var cant = 0;
    for (const paragraph of allParagraphs) {
      cant += getLengthDisplayed(paragraph);
    }
    return cant;
  }

  const getTextFromParagraphs = () => {
    var paragraphsToDisplay = [];
    for (var i = 0; i < allParagraphs.length; i++) {
      paragraphsToDisplay.push(getTextDisplayed(allParagraphs[i]));
    }
    return paragraphsToDisplay.join('');
  }

  const setCompleteTextFromParagraphs = (callSource) => {
    console.log(callSource);
    lyricsEditor.value = getTextFromParagraphs();
  }

  const getParagraphIndexAndPositionInParagraph = (charPosition, currentParagraphs) => {
    var charsPassed = 0;
    var thisParagraphs = currentParagraphs;
    if (thisParagraphs == null) {
      thisParagraphs = allParagraphs;
    }
    for (var i = 0; i < thisParagraphs.length; i++) {
      const p = thisParagraphs[i];
      const nextPassed = charsPassed + getLengthDisplayed(p);
      if (nextPassed > charPosition) {
        return [i, charPosition - charsPassed];
      }
      charsPassed = nextPassed;
    }
    return [thisParagraphs.length, 0];
  }

  const getParagraphsFromUncollapsedText = (completeText) => {
    var newAllParagraph = [];
    var currentParagraphText = '';
    for (const c of completeText) {
      if (c === '\n') {
        currentParagraphText += c;
      } else {
        if (currentParagraphText.length >= 2 &&
          currentParagraphText[currentParagraphText.length - 1] === '\n' &&
          currentParagraphText[currentParagraphText.length - 2] === '\n') {
          newAllParagraph.push(createParagraphObjectFromText(currentParagraphText));
          currentParagraphText = '';
        }
        currentParagraphText += c;
      }
    }
    newAllParagraph.push(createParagraphObjectFromText(currentParagraphText));
    return newAllParagraph;
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
    + getParagraphsFromUncollapsedText
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
    return;
    const allDisplayedLength = getTotalLengthDisplayed();
    if (ev[0] === 'typing') {
      // typing ONE character
      if (allParagraphs.length > 0) {
        if (ev[1] === 0) { // Typed at the beginning
          if (ev[2] === '\n') {
            allParagraphs[0].text = '\n' + allParagraphs[0].text;
          } else { // non enter at the beginning
            if (allParagraphs[0].text[0] === '\n') {
              allParagraphs[0].text = ev[2] + allParagraphs[0].text;
            } else {
              // same as before...
              allParagraphs[0].text = ev[2] + allParagraphs[0].text;
            }
          }
        } else if (ev[1] === allDisplayedLength) {
          // Typed at the end
          console.log('typed at the end');
          const lastParagraph = allParagraphs[allParagraphs.length - 1];
          if (lastParagraph.text[lastParagraph.text.length - 1] === '\n' &&
            lastParagraph.text.length >= 2 &&
            lastParagraph.text[lastParagraph.text.length - 2] === '\n' &&
            ev[2] !== '\n') {
            allParagraphs.push(createParagraphObjectFromText(ev[2]));
          } else {
            allParagraphs[allParagraphs.length - 1].text += ev[2];
          }
        } else {
          // Adding character to non-empty paragra
          console.log('getting paragraph index and char position');
          const [affectedParagraphIndex, positionInParagraph] = getParagraphIndexAndPositionInParagraph(ev[1]);
          console.log('affected index ' + affectedParagraphIndex);
          console.log('pos in paragraph: ' + positionInParagraph);
          if (ev[2] === '\n') {
            if (positionInParagraph > 0) {
              if (allParagraphs[affectedParagraphIndex].text[positionInParagraph - 1] !== '\n') {
                // After non-enter
                console.log('appending enter in middle')
                if (allParagraphs[affectedParagraphIndex].text[positionInParagraph] === '\n') {
                  // before enter one more enter, then split
                  console.log('splitting because of enter');
                  var newParagraphs = [...allParagraphs.slice(0, affectedParagraphIndex)];
                  newParagraphs.push(createParagraphObjectFromText(
                    allParagraphs[affectedParagraphIndex].text.slice(0, positionInParagraph) + '\n\n'
                  ));
                  newParagraphs.push(createParagraphObjectFromText(
                    allParagraphs[affectedParagraphIndex].text.slice(positionInParagraph + 1)
                  ));
                  newParagraphs = newParagraphs.concat([...allParagraphs.slice(affectedParagraphIndex + 1)]);
                  allParagraphs = newParagraphs;
                } else {
                  allParagraphs[affectedParagraphIndex].text = allParagraphs[affectedParagraphIndex].text.slice(
                    0, positionInParagraph
                  ) +
                    ev[2] + allParagraphs[affectedParagraphIndex].text.slice(
                      positionInParagraph
                    );
                }
              } else {
                // After at least 1 enter
                console.log('after at least 1 enter')
                if ((positionInParagraph >= 2
                  && allParagraphs[affectedParagraphIndex].text[positionInParagraph - 2] !== '\n')) {
                  // After exactly 1 enter
                  if (allParagraphs[affectedParagraphIndex].text[positionInParagraph] !== '\n') {
                    // Before non-enter
                    console.log('splitting')
                    var newParagraphs = [...allParagraphs.slice(0, affectedParagraphIndex)];
                    newParagraphs.push(createParagraphObjectFromText(
                      allParagraphs[affectedParagraphIndex].text.slice(0, positionInParagraph) + '\n'
                    ));
                    newParagraphs.push(createParagraphObjectFromText(
                      allParagraphs[affectedParagraphIndex].text.slice(positionInParagraph)
                    ));
                    newParagraphs = newParagraphs.concat([...allParagraphs.slice(affectedParagraphIndex + 1)]);
                    allParagraphs = newParagraphs;
                  } else {
                    // Before at least one enter
                    console.log('beefore at least 1 one enter')
                    allParagraphs[affectedParagraphIndex].text = allParagraphs[affectedParagraphIndex].text.slice(0, positionInParagraph + 1) +
                      ev[2] +
                      allParagraphs[affectedParagraphIndex].text.slice(positionInParagraph + 1);
                  }
                } else {
                  // After at least two enters
                  console.log('after at least 2 entersss');
                  allParagraphs[affectedParagraphIndex].text = allParagraphs[affectedParagraphIndex].text.slice(0, positionInParagraph) +
                    ev[2] +
                    allParagraphs[affectedParagraphIndex].text.slice(positionInParagraph);
                }
              }
            } else {
              // TODO:  ENTER AT THE BEGINNING
              allParagraphs[affectedParagraphIndex - 1].text += '\n';
            }
          } else {
            // Non-enter
            console.log('non enter in some paragraph')
            if (positionInParagraph === 0) {
              console.log('at beginning of paragraph')
              allParagraphs[affectedParagraphIndex].text = ev[2] + allParagraphs[affectedParagraphIndex].text;
            } else if (positionInParagraph === allParagraphs[affectedParagraphIndex].text.length - 1) {
              console.log('at the end of paragraph')

              if (allParagraphs[affectedParagraphIndex].text[positionInParagraph - 1] === '\n' &&
                positionInParagraph >= 2 &&
                allParagraphs[affectedParagraphIndex].text[positionInParagraph - 2] === '\n') {
                // Append character at beginning of next paragraph
                if (affectedParagraphIndex + 1 < allParagraphs.length) {
                  allParagraphs[affectedParagraphIndex].text = allParagraphs[affectedParagraphIndex].text.slice(
                    0, allParagraphs[affectedParagraphIndex].text.length - 1
                  );
                  allParagraphs[affectedParagraphIndex + 1].text = ev[2] + '\n' +
                    allParagraphs[affectedParagraphIndex + 1].text;
                } else {
                  // Should never happend, situation for last character already seen
                }
              } else {
                // merge paragraphs
                console.log('merging paragraphs 2');
                var newParagraphs = allParagraphs.slice(0, affectedParagraphIndex);
                newParagraphs.push(createParagraphObjectFromText(
                  allParagraphs[affectedParagraphIndex].text.slice(0, allParagraphs[affectedParagraphIndex].text.length - 1) +
                  ev[2] + '\n' +
                  allParagraphs[affectedParagraphIndex + 1].text
                ))
                newParagraphs = newParagraphs.concat([...allParagraphs.slice(affectedParagraphIndex + 2)]);
                allParagraphs = newParagraphs;
              }
            } else {
              if ((positionInParagraph > 0 &&
                allParagraphs[affectedParagraphIndex].text[positionInParagraph - 1] !== '\n')
                ||
                (positionInParagraph < allParagraphs[affectedParagraphIndex].text.length - 1 &&
                  allParagraphs[affectedParagraphIndex].text[positionInParagraph + 1] !== '\n')
              ) {
                // After or before non-enter
                allParagraphs[affectedParagraphIndex].text = allParagraphs[affectedParagraphIndex].text.slice(0, positionInParagraph) +
                  ev[2] +
                  allParagraphs[affectedParagraphIndex].text.slice(positionInParagraph);
              } else if (positionInParagraph > 0 &&
                allParagraphs[affectedParagraphIndex].text[positionInParagraph - 1] === '\n' &&
                (positionInParagraph < 2 || allParagraphs[affectedParagraphIndex].text[positionInParagraph - 2] !== '\n')
              ) {
                // After one enter
                console.log('after one enter');
                if (positionInParagraph === allParagraphs[affectedParagraphIndex].text.length - 1 &&
                  affectedParagraphIndex + 1 < allParagraphs.length) {
                  // Then starts next paragraph
                  // Merge paragraphs
                  console.log('merging paragraphs')
                  var newParagraphs = allParagraphs.slice(0, affectedParagraphIndex);
                  newParagraphs.push(createParagraphObjectFromText(
                    allParagraphs[affectedParagraphIndex].text.slice(0, allParagraphs[affectedParagraphIndex].text.length - 1) +
                    ev[2] + '\n' +
                    allParagraphs[affectedParagraphIndex + 1].text
                  ))
                  newParagraphs = newParagraphs.concat([...allParagraphs.slice(affectedParagraphIndex + 2)]);
                  allParagraphs = newParagraphs;
                } else if (positionInParagraph + 1 < allParagraphs[affectedParagraphIndex].text.length &&
                  allParagraphs[affectedParagraphIndex].text[positionInParagraph] === '\n' &&
                  allParagraphs[affectedParagraphIndex].text[positionInParagraph + 1] === '\n') {
                  // before two enters
                  allParagraphs[affectedParagraphIndex].text = allParagraphs[affectedParagraphIndex].text.slice(0, positionInParagraph) +
                    ev[2] +
                    allParagraphs[affectedParagraphIndex].text.slice(positionInParagraph);
                } else {
                  allParagraphs[affectedParagraphIndex].text = allParagraphs[affectedParagraphIndex].text.slice(0, positionInParagraph) +
                    ev[2] +
                    allParagraphs[affectedParagraphIndex].text.slice(positionInParagraph);
                }
              } else {
                // After 2 enters or more
                if (positionInParagraph === allParagraphs[affectedParagraphIndex].text.length - 1) {
                  // Just before first line on next paragraph
                  allParagraphs[affectedParagraphIndex + 1].text = allParagraphs[affectedParagraphIndex + 1].text.slice(
                    0, allParagraphs[affectedParagraphIndex + 1].text.length
                  ); // Removing last enter
                  allParagraphs[affectedParagraphIndex + 1].text = ev[2] +
                    '\n' + // Adding enter in next paragraph
                    allParagraphs[affectedParagraphIndex + 1].text;
                } else {
                  console.log('creating new paragraph in the middle')
                  var newParagraphs = allParagraphs.slice(0, affectedParagraphIndex + 1);
                  newParagraphs[affectedParagraphIndex].text = newParagraphs[affectedParagraphIndex].text.slice(
                    0, newParagraphs[affectedParagraphIndex].text.length - 2 // removing last two enters
                  )
                  newParagraphs.push(createParagraphObjectFromText(ev[2] + '\n\n'));
                  newParagraphs = newParagraphs.concat([...allParagraphs.slice(affectedParagraphIndex + 1)]);
                  allParagraphs = newParagraphs;
                }
              }
            }
          }

          /*
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
          } */
        }
      } else {
        allParagraphs = [createParagraphObjectFromText(ev[2])];
      }
    }
    console.log(allParagraphs);
    setCompleteTextFromParagraphs('source1');
    lyricsEditor.selectionStart = ev[1] + 1;
    lyricsEditor.selectionEnd = ev[1] + 1;
  }


  const setLineNumbersAndButtons = () => {
    for (const btn of arrowsDiv.querySelectorAll('button')) {
      btn.remove();
    }
    for (const br of arrowsDiv.querySelectorAll('div')) {
      br.remove();
    }
    var leftLineCounterLines = [];
    var rightLineCounterLines = [];
    var nxtForLeft = 1;
    var nxtForRight = 1;
    for (var i = 0; i < allParagraphs.length; i++) {
      const paragraph = allParagraphs[i];
      if (i === 0) {
        var j = 0;
        while (j < paragraph.text.length && paragraph.text[j] === '\n') {
          var emptyLinesBetweenButtons = document.createElement('div');
          emptyLinesBetweenButtons.style.height = '16px';
          leftLineCounterLines.push('');
          rightLineCounterLines.push('');
          arrowsDiv.appendChild(emptyLinesBetweenButtons);
          j += 1;
        }
      }
      if (allParagraphs[i].isCounted) {
        leftLineCounterLines.push(nxtForLeft + '.');
        rightLineCounterLines.push(nxtForRight + '.');
        nxtForLeft += 1;
        nxtForRight += 1;
      } else {
        leftLineCounterLines.push('');
        rightLineCounterLines.push('');
        nxtForLeft = 1;
      }

      const buttonsDiv = document.createElement('div')
      buttonsDiv.style.display = 'flex';
      buttonsDiv.style.height = '16px';
      buttonsDiv.style.minHeight = '16px';
      buttonsDiv.style.maxHeight = '16px';
      buttonsDiv.appendChild(getDownArrowButton(i));
      // buttonsDiv.appendChild(getUncountButton(i));
      arrowsDiv.appendChild(buttonsDiv);
      var paragraphLinesCount = paragraph.isCollapsed ? 1 : paragraph.text.trimLeft().split('\n').length - 2;
      for (var asd = 0; asd < paragraphLinesCount; asd++) {
        var emptyLinesBetweenButtons = document.createElement('div');
        emptyLinesBetweenButtons.style.height = '16px';
        leftLineCounterLines.push('');
        rightLineCounterLines.push('');
        arrowsDiv.appendChild(emptyLinesBetweenButtons);
      }
    }
    leftLineCounter.value = leftLineCounterLines.join('\n');
    rightLineCounter.value = rightLineCounterLines.join('\n');
    //lineCountCache = lineCount;
  }

  const doCollapse = (paragraphNum) => {
    const this_btn_id = 'arrow_btn_' + paragraphNum;
    if (allParagraphs[paragraphNum].isCollapsed === false) {
      if (allParagraphs[paragraphNum].text[allParagraphs[paragraphNum].text.length - 1] != '\n') {
        allParagraphs[paragraphNum].text += '\n';
      }
      if (allParagraphs[paragraphNum].text[allParagraphs[paragraphNum].text.length - 2] != '\n') {
        allParagraphs[paragraphNum].text += '\n';
      }
      allParagraphs[paragraphNum].isCollapsed = true;
      document.getElementById(this_btn_id).textContent = 'v ' + this_btn_id.split('_')[2];
    } else {
      allParagraphs[paragraphNum].isCollapsed = false;
      document.getElementById(this_btn_id).textContent = '^ ' + paragraphNum;
    }
    setCompleteTextFromParagraphs('source2');
    setLineNumbersAndButtons();
  }

  const getDownArrowButton = (paragraphNum) => {
    const btn = document.createElement('button');
    btn.textContent = (allParagraphs[paragraphNum].isCollapsed === false ? '^ ' : 'v ') + paragraphNum;
    // btn.style.marginTop = '18px';
    //btn.style.height = '20px';
    btn.style.color = '#ffffff';
    btn.style.backgroundColor = '#000000';
    const this_btn_id = 'arrow_btn_' + paragraphNum;
    btn.id = this_btn_id;
    if (allParagraphs[paragraphNum].text.trimLeft().split('\n').length === 1) {
      btn.setAttribute('disabled', true);
    }
    btn.onclick = () => {
      doCollapse(paragraphNum);
    }
    return btn;
  }

  const setCountOrUncount = (paragraphNum) => {
    // const this_btn_id = 'is_counted_btn_' + paragraphNum;
    if (allParagraphs[paragraphNum].isCounted === false) {
      allParagraphs[paragraphNum].isCounted = true;
      // document.getElementById(this_btn_id).textContent = 'uncount ' + paragraphNum;
    } else {
      allParagraphs[paragraphNum].isCounted = false;
      // document.getElementById(this_btn_id).textContent = 'count ' + paragraphNum;
    }
    const ss = lyricsEditor.selectionStart;
    const se = lyricsEditor.selectionEnd;
    setCompleteTextFromParagraphs('source3');
    lyricsEditor.setSelectionRange(ss, se);
    // lyricsEditor.selectionStart = ss;
    // lyricsEditor.selectionEnd = se;
    setLineNumbersAndButtons();
  }

  const getAllParagraphsFromTextValue = (longText) => {
    if (longText.length === 0) {
      allParagraphs = [createParagraphObjectFromText('')];
      return;
    }
    var newParagraphs = [];
    var lastText = '';
    var i = 0;
    while (i < longText.length && longText[i] === '\n') {
      lastText += '\n';
      i++;
    }
    if (i < longText.length) {
      lastText += longText[i];
      i++;
    }
    for (; i < longText.length; i++) {
      if (longText[i] !== '\n' && i > 1 && longText[i - 1] === '\n' && longText[i - 2] === '\n') {
        newParagraphs.push(createParagraphObjectFromText(lastText));
        lastText = longText[i];
      } else {
        lastText += longText[i];
      }
    }
    if (lastText.length) {
      newParagraphs.push(createParagraphObjectFromText(lastText));
    }
    return newParagraphs;
  }

  if (lyricsEditor != null && leftLineCounter != null) {
    lyricsEditor.addEventListener('scroll', () => {
      leftLineCounter.scrollTop = lyricsEditor.scrollTop;
      leftLineCounter.scrollLeft = lyricsEditor.scrollLeft;

      rightLineCounter.scrollTop = lyricsEditor.scrollTop;
      rightLineCounter.scrollLeft = lyricsEditor.scrollLeft;

      arrowsDiv.scrollTop = lyricsEditor.scrollTop;
      arrowsDiv.scrollLeft = lyricsEditor.scrollLeft;

    });

    lyricsEditor.addEventListener('select', (e) => {
      const selectionStart = e.target.selectionStart;
      const selectionEnd = e.target.selectionEnd;
      var movingAfterUncollapsing = 0;
      var oneCollapsed = false;
      for (var x = selectionStart; x < selectionEnd; x++) {
        const [affectedParagraphIndex, positionInParagraph] = getParagraphIndexAndPositionInParagraph(x);
        if (allParagraphs[affectedParagraphIndex].isCollapsed) {
          oneCollapsed = true;
          allParagraphs[affectedParagraphIndex].isCollapsed = false;
          movingAfterUncollapsing += allParagraphs[affectedParagraphIndex].text.length -
            allParagraphs[affectedParagraphIndex].text.trimLeft().split('\n')[0].length - 2;
        }
      }
      if (oneCollapsed) {
        setCompleteTextFromParagraphs('source4');
        setLineNumbersAndButtons();
        lyricsEditor.setSelectionRange(selectionStart, selectionEnd + movingAfterUncollapsing);

      } else {
      }

    });

    var previousStart, previousEnd;

    lyricsEditor.addEventListener('keydown', (e) => {
      var pressedKeyCode = e.keyCode;
      var pressedChar = e.key;
      const isCtrlPressed = e.metaKey || e.ctrlKey;
      let { value, selectionStart, selectionEnd } = lyricsEditor;
      /*
      if (pressedKeyCode === 9) {  // TAB = 9
        e.preventDefault();
        lyricsEditor.value = value.slice(0, selectionStart) + '\t' + value.slice(selectionEnd);
        lyricsEditor.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }
      */
      var charToAdd = pressedChar;

      /*
      if (charToAdd === 'Backspace' ||
        (charToAdd.toLocaleLowerCase() === 'x' && isCtrlPressed)) {
        e.preventDefault();
        console.log('erasing');
        console.log(lyricsEditor.selectionStart);
        console.log(lyricsEditor.selectionEnd);
        const initialSelectionStart = lyricsEditor.selectionStart;
        const initialSelectionEnd = lyricsEditor.selectionEnd;
        var lyricsEditorValue = lyricsEditor.value.substring(0, initialSelectionStart - 1) + lyricsEditor.value.substring(lyricsEditor.selectionStart);
        if (lyricsEditor.selectionStart !== lyricsEditor.selectionEnd) {
          lyricsEditorValue = lyricsEditor.value.substring(0, initialSelectionStart) + lyricsEditor.value.substring(lyricsEditor.selectionEnd);
        }
        lyricsEditor.value = lyricsEditorValue;
        if (initialSelectionStart === initialSelectionEnd) {
          lyricsEditor.selectionStart = initialSelectionStart - 1;
          lyricsEditor.selectionEnd = initialSelectionStart - 1;
        } else {
          lyricsEditor.selectionStart = initialSelectionStart;
          lyricsEditor.selectionEnd = initialSelectionStart;
        }
        getAllParagraphsFromTextValue(lyricsEditor.value);
      } else {
        */
      if (charToAdd === 'Enter') {
        charToAdd = '\n';
      } else if (charToAdd === 'Tab') {
        charToAdd = '\t';
      }
      var textEvent;
      var prevented = false;
      if (isCtrlPressed) {
        if (charToAdd.toLocaleLowerCase() === 'v') {
          alert('No pasting allowed');
          e.preventDefault();
        } else if (charToAdd.toLocaleLowerCase() === 'j') {
          for (var idx = getParagraphIndexAndPositionInParagraph(selectionStart)[0];
            idx <= getParagraphIndexAndPositionInParagraph(selectionEnd)[0];
            idx++) {
            if (idx < allParagraphs.length) {
              setCountOrUncount(idx);
            } else if (idx === allParagraphs.length && selectionStart === selectionEnd) {
              setCountOrUncount(idx - 1);
            }
          }
          //const [affectedIndex, pos] = getParagraphIndexAndPositionInParagraph(selectionStart);
          e.preventDefault();
        }
      } else {
        if (charToAdd.length === 1 || charToAdd === 'Backspace') {
          for (var idx = selectionStart; idx <= selectionEnd; idx++) {
            const [affectedParagraphIndex, positionInParagraph] = getParagraphIndexAndPositionInParagraph(idx);
            if (affectedParagraphIndex < allParagraphs.length) {
              if (allParagraphs[affectedParagraphIndex].isCollapsed) {
                e.preventDefault();
                prevented = true;
                alert("You are going to edit a collapsed paragraph (position " + (affectedParagraphIndex + 1) + "). Uncollapse and then edit.");
                break;
              } else if (
                positionInParagraph === allParagraphs[affectedParagraphIndex].text.length - 1 &&
                affectedParagraphIndex + 1 < allParagraphs.length &&
                allParagraphs[affectedParagraphIndex + 1].isCollapsed
              ) {
                e.preventDefault();
                prevented = true;
                alert("You are going to merge a collapsed paragraph (position " + (affectedParagraphIndex + 1) + "). Uncollapse and then edit.");
                break;
              }
            }
          }
          if (selectionStart === selectionEnd) {
            textEvent = ['typing', selectionStart, charToAdd];
          } else {
            textEvent = [];
          }
          //e.preventDefault();
          //processEvent(textEvent);
          //allEvents.push(textEvent);
          //setLineNumbersAndButtons();
        } else {
        }
        if (!prevented) {
          previousStart = selectionStart;
          previousEnd = selectionEnd;
        }
      }
    });

    lyricsEditor.addEventListener('input', () => {
      var newParagraphs = getAllParagraphsFromTextValue(lyricsEditor.value);
      if (newParagraphs.length === allParagraphs.length) {
        for (var i = 0; i < allParagraphs.length; i++) {
          newParagraphs[i].isCounted = allParagraphs[i].isCounted;
          if (allParagraphs[i].isCollapsed) {
            newParagraphs[i].isCollapsed = allParagraphs[i].isCollapsed;
            newParagraphs[i].text = allParagraphs[i].text;
          }
        }
      } else if (previousStart === previousEnd) {
        const [idx, pos] = getParagraphIndexAndPositionInParagraph(previousStart, newParagraphs);
        for (var i = 0; i < idx; i++) {
          newParagraphs[i].isCounted = allParagraphs[i].isCounted;
          if (allParagraphs[i].isCollapsed) {
            newParagraphs[i].isCollapsed = allParagraphs[i].isCollapsed;
            newParagraphs[i].text = allParagraphs[i].text;
          }
        }
        for (var i = idx + 1; i < Math.max(newParagraphs.length, allParagraphs.length); i++) {
          var prevCount, newCount;
          if (allParagraphs.length < newParagraphs.length) {
            prevCount = i - 1;
            newCount = i;
          } else {
            prevCount = i;
            newCount = i - 1;
          }
          newParagraphs[newCount].isCounted = allParagraphs[prevCount].isCounted;
          if (allParagraphs[prevCount].isCollapsed) {
            newParagraphs[newCount].isCollapsed = allParagraphs[prevCount].isCollapsed;
            newParagraphs[newCount].text = allParagraphs[prevCount].text;
          }
        }
      } else {
        // removed possibly more than one paragraph
        const [startIdx, spos] = getParagraphIndexAndPositionInParagraph(previousStart, newParagraphs);
        const [endIdx, epos] = getParagraphIndexAndPositionInParagraph(previousEnd, newParagraphs);
        for (var i = 0; i < startIdx; i++) {
          newParagraphs[i].isCounted = allParagraphs[i].isCounted;
          if (allParagraphs[i].isCollapsed) {
            newParagraphs[i].isCollapsed = allParagraphs[i].isCollapsed;
            newParagraphs[i].text = allParagraphs[i].text;
          }
        }
        for (var i = endIdx + 1; i < Math.max(newParagraphs.length, allParagraphs.length); i++) {
          var prevCount, newCount;
          if (allParagraphs.length > newParagraphs.length) {
            newCount = i - (endIdx - startIdx) -
              (newParagraphs.length - allParagraphs.length === endIdx - startIdx ? 0 : 1);
            prevCount = i;
          } else {
            // should never happend
            alert('There was an error; report or avoid editing with many letters selected.');
          }
          if (newCount < newParagraphs.length) {
            console.log('matching from before ' + prevCount + ' to ' + newCount);
            newParagraphs[newCount].isCounted = allParagraphs[prevCount].isCounted;
            if (allParagraphs[prevCount].isCollapsed) {
              newParagraphs[newCount].isCollapsed = allParagraphs[prevCount].isCollapsed;
              newParagraphs[newCount].text = allParagraphs[prevCount].text;
            }
          }
        }
      }
      allParagraphs = newParagraphs;
      console.log('done');
      console.log(allParagraphs);
      setLineNumbersAndButtons();
    });
  }

  const doAutosave = () => {
    document.getElementById('lastAutoSaveLabel').textContent = '...';
    store_lyric_api(allParagraphs, lyricsId, (data) => {
      setTimeout(() => {
        const d = new Date();
        document.getElementById('lastAutoSaveLabel').textContent = d.toString();
      }, 1000)
    });
  }

  if (lyricsIdFromUrl) {
    get_lyric_data_api(lyricsIdFromUrl, (data) => {
      allParagraphs = data.data.allParagraphs;
      setCompleteTextFromParagraphs('source5');
      setLineNumbersAndButtons();
    })
  }


  return (
    <div>
      <UserHeader
        loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername}
        redirectWhenLoggedOut={true}
        viewName="lyrics"
        pageLanguage={'en'}
        is_admin={userInfo != null && userInfo.is_admin}
      />
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em", borderRadius: "1%", border: "1px solid"
      }}>
        <div>
          <button className="btn btn-primary" onClick={() => {
            store_lyric_api(allParagraphs, lyricsId, (data) => {
              lyricsId = data.data.id;
              const d = new Date();
              document.getElementById('lastAutoSaveLabel').textContent = (d).toString();
              if (lyricsIdFromUrl.length === 0) {
                document.getElementById('lyricsLink').href = '/lyrics/' + lyricsId;
                document.getElementById('lyricsLink').style.display = 'block';
              }
              if (autosaveInterval != null) {
                clearInterval(autosaveInterval);
              }
              autosaveInterval = setInterval(doAutosave, 1000 * 60);
            })
          }}
            style={{ marginBottom: "1em", color: "#dddddd", backgroundColor: "#000000", borderColor: "#000000" }}>Save lyrics</button>
          <br />
          <label>Autosaved:
          </label>
          <label id='lastAutoSaveLabel'>
            disabled until saved
          </label>
          <br />
          <label>Shortcut: (Command or Ctrl) + J -{'>'} selected paragraphs go out of the count</label>
          <br />
          <a target='blank' id='lyricsLink' style={{ display: 'none' }}>Go to this song</a>
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
