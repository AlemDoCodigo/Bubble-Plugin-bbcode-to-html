function(instance, properties) {
  let box = $('<div>BBCode -> HTML</div>');
  instance.canvas.append(box);
  box.css('background-color', '#FFE599');
  box.css('border', '1px dashed #CCC');
  box.css('height', properties.bubble.height);
  box.css('width', properties.bubble.width);
  box.css('display', 'flex');
  box.css('justify-content', 'center');
  box.css('align-items', 'center');
}