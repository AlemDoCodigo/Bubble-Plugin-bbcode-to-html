function(instance, context) {
  instance.data.output = '';
  instance.data.openTags = [];
  instance.data.captureUrl = false;
  instance.data.url = '';
  instance.data.params = [];

  instance.data.allowedColors = [
      'aqua','black','blue','fuchsia','gray','green','lime','maroon',
      'navy','olive','purple','red','silver','teal','white','yellow'
  ];

  instance.data.inlineTags = [
      'b','i','u','s','del','ins','em','url','color','style','size',
      'img','spoiler','sub','sup'
  ];

  instance.data.blockTags = [
      'center','right','left','quote','pre','code',
      'h1','h2','h3','h4','h5','h6',
      'table','tr','th','td',
      'list','ol','ul','li',
      'youtube'
  ];

  instance.data.rgb2hex = function(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  instance.data.tagAllowedInContext = function(tag) {
      const expectParent = (parentTag) =>
          instance.data.openTags.length > 0 &&
          instance.data.openTags[instance.data.openTags.length - 1] === parentTag;

      if (
          instance.data.blockTags.includes(tag) &&
          instance.data.openTags.length > 0 &&
          instance.data.inlineTags.includes(
              instance.data.openTags[instance.data.openTags.length - 1]
          )
      ) {
          return false;
      }

      switch (tag) {
          case 'tr':
              return expectParent('table');
          case 'td':
          case 'th':
              return expectParent('tr');
          case 'li':
              return expectParent('ul') || expectParent('ol') || expectParent('list');
          default:
              return true;
      }
  };

  instance.data.text = function(txt) {
      if (typeof txt !== 'string') {
          throw new Error('BBCode.text(txt): txt must be a string.');
      }
      if (instance.data.captureUrl) {
          instance.data.url += txt;
      } else {
          instance.data.output += txt;
      }
  };

  instance.data.startTag = function(tag) {
      if (typeof tag !== 'string') {
          throw new Error('BBCode.startTag(tag): tag must be a string.');
      }

      let colorOrHex;
      switch (true) {
          // Headings
          case /^\[h1\]$/i.test(tag): instance.data.output += '<h1>'; break;
          case /^\[h2\]$/i.test(tag): instance.data.output += '<h2>'; break;
          case /^\[h3\]$/i.test(tag): instance.data.output += '<h3>'; break;
          case /^\[h4\]$/i.test(tag): instance.data.output += '<h4>'; break;
          case /^\[h5\]$/i.test(tag): instance.data.output += '<h5>'; break;
          case /^\[h6\]$/i.test(tag): instance.data.output += '<h6>'; break;
          // Negrito, itálico, etc.
          case /^\[b\]$/i.test(tag):   instance.data.output += '<b>'; break;
          case /^\[i\]$/i.test(tag):   instance.data.output += '<i>'; break;
          case /^\[u\]$/i.test(tag):   instance.data.output += '<u>'; break;
          case /^\[s\]$/i.test(tag):   instance.data.output += '<s>'; break;
          case /^\[del\]$/i.test(tag): instance.data.output += '<del>'; break;
          case /^\[ins\]$/i.test(tag): instance.data.output += '<ins>'; break;
          case /^\[em\]$/i.test(tag):  instance.data.output += '<em>'; break;
          case /^\[sub\]$/i.test(tag): instance.data.output += '<sub>'; break;
          case /^\[sup\]$/i.test(tag): instance.data.output += '<sup>'; break;
          // Tamanhos e estilos
          case /^\[size=[0-9]+\]$/i.test(tag):
              instance.data.output += `<span style="font-size: ${tag.slice(6, -1)}pt;">`;
              break;
          case /^\[style size=[0-9]+\]$/i.test(tag):
              instance.data.output += `<span style="font-size: ${tag.slice(12, -1)}pt;">`;
              break;
          // Cores
          case /^\[color=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))\]$/i.test(tag):
          case /^\[style color=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))\]$/i.test(tag):
              {
                const offset = tag.toLowerCase().startsWith('[style color=') ? 13 : 7;
                colorOrHex = tag.slice(offset, -1).toLowerCase();
                if (colorOrHex.startsWith('rgb')) {
                    const onlyRgb = colorOrHex.replace(/[rgb\(\)]/gi, '');
                    const rgbParts = onlyRgb.split(',');
                    colorOrHex = instance.data.rgb2hex(
                        parseInt(rgbParts[0]),
                        parseInt(rgbParts[1]),
                        parseInt(rgbParts[2])
                    );
                }
                if (
                    !colorOrHex.startsWith('#') &&
                    !instance.data.allowedColors.includes(colorOrHex)
                ) {
                    throw new Error('Cor inválida no BBCode.');
                }
                instance.data.output += `<span style="color: ${colorOrHex};">`;
              }
              break;
          // Highlight (novo)
          case /^\[highlight=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))\]$/i.test(tag):
              {
                let highlightColor = tag.match(/highlight=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))/i);
                if (highlightColor) {
                  highlightColor = highlightColor[1].toLowerCase();
                  if (highlightColor.startsWith('rgb')) {
                      const onlyRgb = highlightColor.replace(/[rgb\(\)]/gi, '');
                      const rgbParts = onlyRgb.split(',');
                      highlightColor = instance.data.rgb2hex(
                          parseInt(rgbParts[0]),
                          parseInt(rgbParts[1]),
                          parseInt(rgbParts[2])
                      );
                  }
                  // Abre a tag com background-color
                  instance.data.output += `<span style="background-color: ${highlightColor};">`;
                } else {
                  instance.data.output += `<span>`;
                }
              }
              break;
          // Alinhamentos e blocos
          case /^\[center\]$/i.test(tag):
              instance.data.output += '<div style="text-align: center;">';
              break;
          case /^\[left\]$/i.test(tag):
              instance.data.output += '<div style="text-align: left;">';
              break;
          case /^\[right\]$/i.test(tag):
              instance.data.output += '<div style="text-align: right;">';
              break;
          case /^\[quote\]$/i.test(tag):
              instance.data.output += '<blockquote>';
              break;
          case /^\[pre\]$/i.test(tag):
              instance.data.output += '<pre>';
              break;
          // [code] ou [code=lang]
          case /^\[code\]$/i.test(tag):
              instance.data.output += '<div><pre><code>';
              break;
          case /^\[code=[A-Za-z]+\]$/i.test(tag):
              {
                const lang = tag.slice(6, -1).toLowerCase(); 
                instance.data.output += `<div class="bbcode-code-lang-${lang}"><pre><code>`;
              }
              break;
          // Tabelas
          case /^\[table\]$/i.test(tag): instance.data.output += '<table>'; break;
          case /^\[tr\]$/i.test(tag):    instance.data.output += '<tr>'; break;
          case /^\[td\]$/i.test(tag):    instance.data.output += '<td>'; break;
          case /^\[th\]$/i.test(tag):    instance.data.output += '<th>'; break;
          // Listas
          case /^\[list\]$/i.test(tag):
          case /^\[ul\]$/i.test(tag):
              instance.data.output += '<ul>';
              break;
          case /^\[ol\]$/i.test(tag):
              instance.data.output += '<ol>';
              break;
          case /^\[li\]$/i.test(tag):
              instance.data.output += '<li>';
              break;
          // Spoiler
          case /^\[spoiler\]$/i.test(tag):
              instance.data.output += `<span class="bbcode-spoiler" style="background-color: black; color: black;">`;
              break;
          // --- Imagens ---
          // Formato padrão: [img]
          case /^\[img\]$/i.test(tag):
              instance.data.url = '';
              instance.data.captureUrl = true;
              instance.data.params = [];
              break;
          // Formato [img=300x200]
          case /^\[img=[1-9][0-9]*x[1-9][0-9]*\]$/i.test(tag):
              instance.data.url = '';
              instance.data.captureUrl = true;
              instance.data.params = tag.slice(5, -1).toLowerCase().split('x');
              break;
          // Formato [img width=300 height=200] (sem "px")
          case /^\[img width=[1-9][0-9]* height=[1-9][0-9]*\]$/i.test(tag):
              instance.data.url = '';
              instance.data.captureUrl = true;
              {
                  const parts = tag.slice(5, -1).split(' ');
                  const w = parts[0].split('=')[1];
                  const h = parts[1].split('=')[1];
                  instance.data.params = [w, h];
              }
              break;
          // Formato [img width=250] ou [img width=170px] (apenas largura)
          case /^\[img width=[0-9]+(px)?\]$/i.test(tag):
              instance.data.url = '';
              instance.data.captureUrl = true;
              {
                  const match = tag.match(/width=([0-9]+)(px)?/i);
                  instance.data.params = match ? [match[1]] : [];
              }
              break;
          // YouTube
          case /^\[youtube\]$/i.test(tag):
              instance.data.url = '';
              instance.data.captureUrl = true;
              break;
          // URL sem parâmetro
          case /^\[url\]$/i.test(tag):
              instance.data.url = '';
              instance.data.captureUrl = true;
              break;
          // URL com parâmetro: [url=...]
          case /^\[url=[^\]]+\]$/i.test(tag):
              try {
                  const theUrl = tag.slice(5, -1);
                  const finalUrl = new URL(theUrl).toString();
                  if (/^javascript/i.test(finalUrl)) {
                      throw new Error('javascript scheme não permitido.');
                  }
                  instance.data.output += `<a href='${finalUrl}' target="_blank">`;
              } catch (err) {
                  console.log('URL inválida', err);
              }
              break;
          default:
              console.log('Tag BBCode não reconhecida:', tag);
              instance.data.input = instance.data.input.replace(tag, '');
              break;
      }

      const actualTag = tag.slice(1).split(/[ =\]]/)[0].replace('/', '');
      if (!instance.data.tagAllowedInContext(actualTag)) {
          console.log('Tag não permitida nesse contexto:', actualTag);
          instance.data.input = instance.data.input.replace(tag, '');
          return;
      }
      instance.data.openTags.push(actualTag);
  };

  instance.data.endTag = function(tag) {
      if (typeof tag !== 'string') {
          throw new Error('BBCode.endTag(tag): tag must be a string.');
      }

      switch (true) {
          // Headings
          case /^\[\/h1\]$/i.test(tag): instance.data.output += '</h1>'; break;
          case /^\[\/h2\]$/i.test(tag): instance.data.output += '</h2>'; break;
          case /^\[\/h3\]$/i.test(tag): instance.data.output += '</h3>'; break;
          case /^\[\/h4\]$/i.test(tag): instance.data.output += '</h4>'; break;
          case /^\[\/h5\]$/i.test(tag): instance.data.output += '</h5>'; break;
          case /^\[\/h6\]$/i.test(tag): instance.data.output += '</h6>'; break;
          // Negrito, itálico, etc.
          case /^\[\/b\]$/i.test(tag):   instance.data.output += '</b>'; break;
          case /^\[\/i\]$/i.test(tag):   instance.data.output += '</i>'; break;
          case /^\[\/u\]$/i.test(tag):   instance.data.output += '</u>'; break;
          case /^\[\/s\]$/i.test(tag):   instance.data.output += '</s>'; break;
          case /^\[\/del\]$/i.test(tag): instance.data.output += '</del>'; break;
          case /^\[\/ins\]$/i.test(tag): instance.data.output += '</ins>'; break;
          case /^\[\/em\]$/i.test(tag):  instance.data.output += '</em>'; break;
          case /^\[\/sub\]$/i.test(tag): instance.data.output += '</sub>'; break;
          case /^\[\/sup\]$/i.test(tag): instance.data.output += '</sup>'; break;
          // Size / style / color
          case /^\[\/size\]$/i.test(tag):
          case /^\[\/style\]$/i.test(tag):
          case /^\[\/color\]$/i.test(tag):
              instance.data.output += '</span>';
              break;
          // Highlight (novo)
          case /^\[\/highlight\]$/i.test(tag):
              instance.data.output += '</span>';
              break;
          // Alinhamentos e blocos
          case /^\[\/center\]$/i.test(tag):
          case /^\[\/left\]$/i.test(tag):
          case /^\[\/right\]$/i.test(tag):
              instance.data.output += '</div>';
              break;
          case /^\[\/quote\]$/i.test(tag):
              instance.data.output += '</blockquote>';
              break;
          case /^\[\/pre\]$/i.test(tag):
              instance.data.output += '</pre>';
              break;
          // Code
          case /^\[\/code\]$/i.test(tag):
              instance.data.output += '</code></pre></div>';
              break;
          // Tabelas
          case /^\[\/table\]$/i.test(tag): instance.data.output += '</table>'; break;
          case /^\[\/tr\]$/i.test(tag):    instance.data.output += '</tr>'; break;
          case /^\[\/td\]$/i.test(tag):    instance.data.output += '</td>'; break;
          case /^\[\/th\]$/i.test(tag):    instance.data.output += '</th>'; break;
          // Listas
          case /^\[\/list\]$/i.test(tag):
          case /^\[\/ul\]$/i.test(tag):
              instance.data.output += '</ul>';
              break;
          case /^\[\/ol\]$/i.test(tag):
              instance.data.output += '</ol>';
              break;
          case /^\[\/li\]$/i.test(tag):
              instance.data.output += '</li>';
              break;
          // Spoiler
          case /^\[\/spoiler\]$/i.test(tag):
              instance.data.output += '</span>';
              break;
          // IMG
          case /^\[\/img\]$/i.test(tag): {
              let localParams = instance.data.params;
              let paramString = '';
              if (localParams.length === 1) {
                  paramString = `width="${localParams[0]}" `;
              } else if (localParams.length === 2) {
                  paramString = `width="${localParams[0]}" height="${localParams[1]}" `;
              }
              instance.data.params = [];
              if (instance.data.captureUrl) {
                  instance.data.captureUrl = false;
                  try {
                      let urlStr = instance.data.url;
                      if (urlStr.startsWith("//")) {
                          urlStr = "https:" + urlStr;
                      }
                      const validUrl = new URL(urlStr).toString();
                      instance.data.output += `<img src="${validUrl}" alt="${instance.data.basename(new URL(validUrl).pathname)}" ${paramString}/>`;
                  } catch (err) {
                      console.log('URL de imagem inválida:', err);
                  }
              } else {
                  console.log('BBCode.endTag(tag): internal error [img]');
              }
              break;
          }
          // YouTube
          case /^\[\/youtube\]$/i.test(tag):
              if (instance.data.captureUrl) {
                  instance.data.captureUrl = false;
                  if (/^[A-Za-z0-9_\-]{11}$/.test(instance.data.url)) {
                      instance.data.output += `
                      <div>
                        <iframe width="560" height="315"
                          src="https://www.youtube.com/embed/${instance.data.url}"
                          title="YouTube video player" frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen>
                        </iframe>
                      </div>`;
                  } else {
                      console.log('ID do YouTube inválido:', instance.data.url);
                  }
              }
              break;
          // URL
          case /^\[\/url\]$/i.test(tag):
              if (instance.data.captureUrl) {
                  instance.data.captureUrl = false;
                  try {
                      const validUrl = new URL(instance.data.url).toString();
                      instance.data.output += `<a href="${validUrl}" target="_blank">${validUrl}</a>`;
                  } catch (err) {
                      console.log('URL inválida:', err);
                      instance.data.output += instance.data.url;
                  }
              } else {
                  instance.data.output += '</a>';
              }
              break;
          default:
              console.log('Tag de fechamento não reconhecida:', tag);
              instance.data.input = instance.data.input.replace(tag, '');
              break;
      }

      const expectedTag = instance.data.openTags.pop();
      const actualTag = tag.slice(2).split(/[ =\]]/)[0];
      if (expectedTag !== actualTag) {
          console.log('Tags desbalanceadas. Esperado:', expectedTag, 'Encontrado:', actualTag);
      }
      return instance.data.output;
  };

  instance.data.done = function() {
      if (instance.data.openTags.length !== 0) {
          console.log('BBCode.done(): faltam tags de fechamento:', instance.data.openTags);
      }
      return instance.data.output;
  };

  instance.data.parse = function(input) {
      if (typeof input !== 'string') {
          throw new Error('BBCode.parse(input): input must be a string.');
      }
      instance.data.output = '';
      instance.data.openTags = [];
      input = instance.data.encodeHtmlEntities(input).split('');
      let token = '';
      let in_tag = false;
      while (input.length > 0) {
          const ch = input.shift();
          if (in_tag && ch === ']') {
              token += ch;
              in_tag = false;
              if (token[1] === '/') {
                  instance.data.endTag(token);
              } else {
                  instance.data.startTag(token);
              }
              token = '';
          } else if (!in_tag && ch === '[') {
              input.unshift(ch);
              in_tag = true;
              if (token.length > 0) {
                  instance.data.text(token);
              }
              token = '';
          } else {
              token += ch;
          }
      }
      instance.data.output += token;
      return instance.data.done();
  };

  instance.data.encodeHtmlEntities = function(input) {
      if (typeof input !== 'string') {
          throw new Error('BBCode.encodeEntities(input): input must be a string.');
      }
      return input.replace(/[\u00A0-\u9999<>\&"']/gim, (ch) => `&#${ch.charCodeAt(0)};`);
  };

  instance.data.basename = function(path) {
      return `${path}`.split('/').pop();
  };

  instance.data.bb2HTML = function(input) {
      return instance.data.parse(input);
  };

  instance.data.input = "";

  // Limpa tags indesejadas ou com parâmetros extras, como [li indent=0 align=left]
  instance.data.cleanBBCode = function(input_bbcode) {
      let ret = input_bbcode || "";
      ret = ret.replace('[ml]', '').replace('[/ml]', '');
      ret = ret.replace(/\[li\s+indent=\d+\s+align=\w+\]/gi, "[li]");
      return ret;
  };

  instance.data.insertLineBreaks = function(input_bbcode) {
      return input_bbcode.replace(/\n/g, "<br>");
  };
}