function setEventListeners() {
  //canvas
  canvas.addEventListener("contextmenu", onRClick);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);

  addEventListener("mouseup", onMouseUp);
  //keyboard
  addEventListener("keydown", keyPressed);
  addEventListener("keyup", keyRelease);
  //buttons
  addButton.forEach((button) => {
    button.addEventListener("click", addBox);
  });
  removeButton.forEach((button) => {
    button.addEventListener("click", removeBox);
  });
  gateButtons.forEach((button) => {
    button.addEventListener("mousedown", spawn);
  });
}

function keyPressed(event) {
  if (!pressedKeys.includes(event.keyCode)) pressedKeys.push(event.keyCode);
}

function keyRelease(event) {
  switch (event.keyCode) {
    case keyCodes.plus:
      handleGateInputs(0, currentSelectedGate);
      break;
    case keyCodes.minus:
      handleGateInputs(1, currentSelectedGate);
      break;
    case keyCodes.delete:
      deleteGate(currentSelectedGate);
      break;
  }
  remove(event.keyCode, pressedKeys);
}

function onRClick(event) {
  //   let point = getCurrentSelection(event);
  //   if (point instanceof connectionPoint) if (point != null) point.disconnect();
}

function onClick(event) {
  //check inputboxes
  for (let i = INPUTBOXES.length - 1; i >= 0; i--) {
    let box = INPUTBOXES[i];
    let isIn = isInCircle(
      event,
      box.position.x,
      box.position.y,
      boolBox.radius
    );
    if (isIn) {
      box.toggle();
    }
  }
}
function onMouseDown(event) {
  pressedKeys.push(event.button); //adding mouse button to list
  if (event.button === 0) {
    //on Left Click
    tempSelection = getCurrentSelection(event);
    if (tempSelection instanceof gate) {
      remove(tempSelection, GATES);
      GATES.push(tempSelection);
      currentSelectedGate = tempSelection; /////////
      tempSelection.offset.x = event.offsetX - tempSelection.position.x;
      tempSelection.offset.y = event.offsetY - tempSelection.position.y;
    } else if (tempSelection instanceof outputPoint) {
      currentConLineIndex =
        tempSelection.connections.push(new connectionLine(tempSelection)) - 1;
    }
    // currentSelectedGate = GATES[GATES.length - 1];
  } else if (event.button == 2) {
    //on Right Click
    let point = getCurrentSelection(event);
    if (point instanceof connectionPoint) if (point != null) point.disconnect();
  }
  // root.style.setProperty("--cursor", "grabbing"); ////////////
}

function onMouseMove(event) {
  if (pressedKeys.includes(0)) {
    if (tempSelection instanceof gate) {
      //Moving Gate
      tempSelection.position.x = event.offsetX - tempSelection.offset.x;
      tempSelection.position.y = event.offsetY - tempSelection.offset.y;
    } else if (tempSelection instanceof outputPoint) {
      //Moving Connection Line
      tempSelection.connections[currentConLineIndex].end.position.x =
        event.offsetX;
      tempSelection.connections[currentConLineIndex].end.position.y =
        event.offsetY;
      snapable = isSnapable(event);
      if (snapable && snapable.connection == null) {
        //temp replace
        tempSelection.connections[currentConLineIndex].end.position.x =
          snapable.position.x;
        tempSelection.connections[currentConLineIndex].end.position.y =
          snapable.position.y;
      }
    }
  }
  if (pressedKeys.includes(2)) {
    let point = getCurrentSelection(event);
    if (point instanceof connectionPoint) if (point != null) point.disconnect();
  }
  // show label on hover
  [...connectionPoints.input, ...connectionPoints.output].forEach((con) => {
    let isIn = isInCircle(
      event,
      con.position.x,
      con.position.y,
      connectionPoint.radius
    );
    if (
      isIn &&
      (pressedKeys.includes(keyCodes.control) ||
        pressedKeys.includes(keyCodes.command))
    ) {
      con.hover = true;
    } else con.hover = false;
  });
}

function onMouseUp(event) {
  if (event.button === 0) {
    if (tempSelection instanceof outputPoint) {
      if (snapable && snapable.connection == null) {
        snapable.connect(tempSelection.connections[currentConLineIndex]);
        snapable = false;
      } else {
        tempSelection.disconnect(currentConLineIndex);
      }
    }
    tempSelection = null;
  }
  remove(event.button, pressedKeys); //removing mouse button from list
  //Mark gates for delete if out of frame
  markForDelete();
  // root.style.setProperty("--cursor", "grab"); ///////////
}
