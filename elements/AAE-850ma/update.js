function(instance, properties, context) {
  instance.data.input = properties.bbcode || "";
  instance.data.output = "";
  instance.data.openTags = [];
  instance.data.captureUrl = false;
  instance.data.url = "";
  instance.data.params = [];

  try {
      if (instance.data.input.length > 0) {
          instance.data.input = instance.data.cleanBBCode(instance.data.input);
          let result = instance.data.bb2HTML(instance.data.input);
          result = instance.data.insertLineBreaks(result);
          instance.publishState('html', result);
      } else {
          instance.publishState('html', "");
      }
  } catch (err) {
      console.log("Erro ao converter BBCode -> HTML:", err);
      instance.publishState('html', instance.data.input);
  }
}