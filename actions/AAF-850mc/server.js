function(properties, context) {
  // Entradas
  const input_bbcode = properties.input_bbcode || '';

  // Variáveis de estado
  let output = '';
  let openTags = [];
  let captureUrl = false;
  let url = '';
  let params = [];

  const allowedColors = [
    'aqua','black','blue','fuchsia','gray','green','lime','maroon',
    'navy','olive','purple','red','silver','teal','white','yellow'
  ];

  const inlineTags = [
    'b','i','u','s','del','ins','em','url','color','style','size',
    'img','spoiler','sub','sup'
  ];

  const blockTags = [
    'center','right','left','quote','pre','code',
    'h1','h2','h3','h4','h5','h6',
    'table','tr','th','td',
    'list','ol','ul','li',
    'youtube'
  ];

  function rgb2hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function tagAllowedInContext(tag) {
    const expectParent = (parentTag) =>
      openTags.length > 0 &&
      openTags[openTags.length - 1] === parentTag;

    if (
      blockTags.includes(tag) &&
      openTags.length > 0 &&
      inlineTags.includes(openTags[openTags.length - 1])
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
  }

  function text(txt) {
    if (typeof txt !== 'string') {
      throw new Error('BBCode.text(txt): txt must be a string.');
    }
    if (captureUrl) {
      url += txt;
    } else {
      output += txt;
    }
  }

  function startTag(tag) {
    if (typeof tag !== 'string') {
      throw new Error('BBCode.startTag(tag): tag must be a string.');
    }

    let colorOrHex;
    switch (true) {
      case /^\[h1\]$/i.test(tag): output += '<h1>'; break;
      case /^\[h2\]$/i.test(tag): output += '<h2>'; break;
      case /^\[h3\]$/i.test(tag): output += '<h3>'; break;
      case /^\[h4\]$/i.test(tag): output += '<h4>'; break;
      case /^\[h5\]$/i.test(tag): output += '<h5>'; break;
      case /^\[h6\]$/i.test(tag): output += '<h6>'; break;

      case /^\[b\]$/i.test(tag):   output += '<b>'; break;
      case /^\[i\]$/i.test(tag):   output += '<i>'; break;
      case /^\[u\]$/i.test(tag):   output += '<u>'; break;
      case /^\[s\]$/i.test(tag):   output += '<s>'; break;
      case /^\[del\]$/i.test(tag): output += '<del>'; break;
      case /^\[ins\]$/i.test(tag): output += '<ins>'; break;
      case /^\[em\]$/i.test(tag):  output += '<em>'; break;
      case /^\[sub\]$/i.test(tag): output += '<sub>'; break;
      case /^\[sup\]$/i.test(tag): output += '<sup>'; break;

      case /^\[size=[0-9]+\]$/i.test(tag):
        output += `<span style="font-size: ${tag.slice(6, -1)}pt;">`;
        break;
      case /^\[style size=[0-9]+\]$/i.test(tag):
        output += `<span style="font-size: ${tag.slice(12, -1)}pt;">`;
        break;

      case /^\[color=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))\]$/i.test(tag):
      case /^\[style color=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))\]$/i.test(tag):
        {
          const offset = tag.toLowerCase().startsWith('[style color=') ? 13 : 7;
          colorOrHex = tag.slice(offset, -1).toLowerCase();
          if (colorOrHex.startsWith('rgb')) {
            const onlyRgb = colorOrHex.replace(/[rgb\(\)]/gi, '');
            const rgbParts = onlyRgb.split(',');
            colorOrHex = rgb2hex(
              parseInt(rgbParts[0]),
              parseInt(rgbParts[1]),
              parseInt(rgbParts[2])
            );
          }
          if (
            !colorOrHex.startsWith('#') &&
            !allowedColors.includes(colorOrHex)
          ) {
            throw new Error('Cor inválida no BBCode.');
          }
          output += `<span style="color: ${colorOrHex};">`;
        }
        break;

      case /^\[highlight=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))\]$/i.test(tag):
        {
          let highlightColor = tag.match(/highlight=([A-Za-z]+|#[0-9a-f]{6}|rgb\(.+\))/i);
          if (highlightColor) {
            highlightColor = highlightColor[1].toLowerCase();
            if (highlightColor.startsWith('rgb')) {
              const onlyRgb = highlightColor.replace(/[rgb\(\)]/gi, '');
              const rgbParts = onlyRgb.split(',');
              highlightColor = rgb2hex(
                parseInt(rgbParts[0]),
                parseInt(rgbParts[1]),
                parseInt(rgbParts[2])
              );
            }
            output += `<span style="background-color: ${highlightColor};">`;
          } else {
            output += `<span>`;
          }
        }
        break;

      case /^\[center\]$/i.test(tag): output += '<div style="text-align: center;">'; break;
      case /^\[left\]$/i.test(tag):   output += '<div style="text-align: left;">'; break;
      case /^\[right\]$/i.test(tag):  output += '<div style="text-align: right;">'; break;
      case /^\[quote\]$/i.test(tag):  output += '<blockquote>'; break;
      case /^\[pre\]$/i.test(tag):    output += '<pre>'; break;
      case /^\[code\]$/i.test(tag):   output += '<div><pre><code>'; break;
      case /^\[code=[A-Za-z]+\]$/i.test(tag):
        {
          const lang = tag.slice(6, -1).toLowerCase(); 
          output += `<div class="bbcode-code-lang-${lang}"><pre><code>`;
        }
        break;

      case /^\[table\]$/i.test(tag): output += '<table>'; break;
      case /^\[tr\]$/i.test(tag):    output += '<tr>'; break;
      case /^\[td\]$/i.test(tag):    output += '<td>'; break;
      case /^\[th\]$/i.test(tag):    output += '<th>'; break;

      case /^\[list\]$/i.test(tag):
      case /^\[ul\]$/i.test(tag):
        output += '<ul>';
        break;
      case /^\[ol\]$/i.test(tag):
        output += '<ol>';
        break;
      case /^\[li\]$/i.test(tag):
        output += '<li>';
        break;

      case /^\[spoiler\]$/i.test(tag):
        output += `<span class="bbcode-spoiler" style="background-color: black; color: black;">`;
        break;

      // Imagens
      case /^\[img\]$/i.test(tag):
        url = '';
        captureUrl = true;
        params = [];
        break;
      case /^\[img=([1-9][0-9]*)x([1-9][0-9]*)\]$/i.test(tag):
        url = '';
        captureUrl = true;
        params = tag.slice(5, -1).toLowerCase().split('x');
        break;
      case /^\[img width=[1-9][0-9]* height=[1-9][0-9]*\]$/i.test(tag):
        url = '';
        captureUrl = true;
        {
          const parts = tag.slice(5, -1).split(' ');
          const w = parts[0].split('=')[1];
          const h = parts[1].split('=')[1];
          params = [w, h];
        }
        break;
      case /^\[img width=[0-9]+(px)?\]$/i.test(tag):
        url = '';
        captureUrl = true;
        {
          const match = tag.match(/width=([0-9]+)(px)?/i);
          params = match ? [match[1]] : [];
        }
        break;

      case /^\[youtube\]$/i.test(tag):
        url = '';
        captureUrl = true;
        break;

      case /^\[url\]$/i.test(tag):
        url = '';
        captureUrl = true;
        break;
      case /^\[url=[^\]]+\]$/i.test(tag):
        try {
          const theUrl = tag.slice(5, -1);
          const finalUrl = new URL(theUrl).toString();
          if (/^javascript/i.test(finalUrl)) {
            throw new Error('javascript scheme não permitido.');
          }
          output += `<a href='${finalUrl}' target="_blank">`;
        } catch (err) {
          // Ignora URL inválida
        }
        break;
      default:
        // Tag não reconhecida
        break;
    }

    const actualTag = tag.slice(1).split(/[ =\]]/)[0].replace('/', '');
    if (!tagAllowedInContext(actualTag)) {
      return;
    }
    openTags.push(actualTag);
  }

  function endTag(tag) {
    if (typeof tag !== 'string') {
      throw new Error('BBCode.endTag(tag): tag must be a string.');
    }

    switch (true) {
      case /^\[\/h1\]$/i.test(tag): output += '</h1>'; break;
      case /^\[\/h2\]$/i.test(tag): output += '</h2>'; break;
      case /^\[\/h3\]$/i.test(tag): output += '</h3>'; break;
      case /^\[\/h4\]$/i.test(tag): output += '</h4>'; break;
      case /^\[\/h5\]$/i.test(tag): output += '</h5>'; break;
      case /^\[\/h6\]$/i.test(tag): output += '</h6>'; break;

      case /^\[\/b\]$/i.test(tag):   output += '</b>'; break;
      case /^\[\/i\]$/i.test(tag):   output += '</i>'; break;
      case /^\[\/u\]$/i.test(tag):   output += '</u>'; break;
      case /^\[\/s\]$/i.test(tag):   output += '</s>'; break;
      case /^\[\/del\]$/i.test(tag): output += '</del>'; break;
      case /^\[\/ins\]$/i.test(tag): output += '</ins>'; break;
      case /^\[\/em\]$/i.test(tag):  output += '</em>'; break;
      case /^\[\/sub\]$/i.test(tag): output += '</sub>'; break;
      case /^\[\/sup\]$/i.test(tag): output += '</sup>'; break;

      case /^\[\/size\]$/i.test(tag):
      case /^\[\/style\]$/i.test(tag):
      case /^\[\/color\]$/i.test(tag):
        output += '</span>';
        break;

      case /^\[\/highlight\]$/i.test(tag):
        output += '</span>';
        break;

      case /^\[\/center\]$/i.test(tag):
      case /^\[\/left\]$/i.test(tag):
      case /^\[\/right\]$/i.test(tag):
        output += '</div>';
        break;
      case /^\[\/quote\]$/i.test(tag):
        output += '</blockquote>';
        break;
      case /^\[\/pre\]$/i.test(tag):
        output += '</pre>';
        break;

      case /^\[\/code\]$/i.test(tag):
        output += '</code></pre></div>';
        break;

      case /^\[\/table\]$/i.test(tag): output += '</table>'; break;
      case /^\[\/tr\]$/i.test(tag):    output += '</tr>'; break;
      case /^\[\/td\]$/i.test(tag):    output += '</td>'; break;
      case /^\[\/th\]$/i.test(tag):    output += '</th>'; break;

      case /^\[\/list\]$/i.test(tag):
      case /^\[\/ul\]$/i.test(tag):
        output += '</ul>';
        break;
      case /^\[\/ol\]$/i.test(tag):
        output += '</ol>';
        break;
      case /^\[\/li\]$/i.test(tag):
        output += '</li>';
        break;

      case /^\[\/spoiler\]$/i.test(tag):
        output += '</span>';
        break;

      case /^\[\/img\]$/i.test(tag): {
        let localParams = params;
        let paramString = '';
        if (localParams.length === 1) {
          paramString = `width="${localParams[0]}" `;
        } else if (localParams.length === 2) {
          paramString = `width="${localParams[0]}" height="${localParams[1]}" `;
        }
        params = [];
        if (captureUrl) {
          captureUrl = false;
          try {
            let urlStr = url;
            if (urlStr.startsWith("//")) {
              urlStr = "https:" + urlStr;
            }
            const validUrl = new URL(urlStr).toString();
            output += `<img src="${validUrl}" alt="${basename(new URL(validUrl).pathname)}" ${paramString}/>`;
          } catch (err) {
            // Ignora url inválida
          }
        }
        break;
      }

      case /^\[\/youtube\]$/i.test(tag):
        if (captureUrl) {
          captureUrl = false;
          if (/^[A-Za-z0-9_\-]{11}$/.test(url)) {
            output += `
              <div>
                <iframe width="560" height="315"
                  src="https://www.youtube.com/embed/${url}"
                  title="YouTube video player" frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen>
                </iframe>
              </div>`;
          }
        }
        break;

      case /^\[\/url\]$/i.test(tag):
        if (captureUrl) {
          captureUrl = false;
          try {
            const validUrl = new URL(url).toString();
            output += `<a href="${validUrl}" target="_blank">${validUrl}</a>`;
          } catch (err) {
            output += url;
          }
        } else {
          output += '</a>';
        }
        break;
      default:
        // Tag de fechamento não reconhecida
        break;
    }

    openTags.pop();
  }

  function done() {
    return output;
  }

  function encodeHtmlEntities(input) {
    if (typeof input !== 'string') {
      throw new Error('BBCode.encodeEntities(input): input must be a string.');
    }
    return input.replace(/[\u00A0-\u9999<>\&"']/gim, (ch) => `&#${ch.charCodeAt(0)};`);
  }

  function basename(path) {
    return `${path}`.split('/').pop();
  }

  function parse(input) {
    if (typeof input !== 'string') {
      throw new Error('BBCode.parse(input): input must be a string.');
    }
    output = '';
    openTags = [];
    let arr = encodeHtmlEntities(input).split('');
    let token = '';
    let in_tag = false;
    while (arr.length > 0) {
      const ch = arr.shift();
      if (in_tag && ch === ']') {
        token += ch;
        in_tag = false;
        if (token[1] === '/') {
          endTag(token);
        } else {
          startTag(token);
        }
        token = '';
      } else if (!in_tag && ch === '[') {
        arr.unshift(ch);
        in_tag = true;
        if (token.length > 0) {
          text(token);
        }
        token = '';
      } else {
        token += ch;
      }
    }
    output += token;
    return done();
  }

  // Limpa tags indesejadas ou com parâmetros extras
  function cleanBBCode(input_bbcode) {
    let ret = input_bbcode || "";
    ret = ret.replace('[ml]', '').replace('[/ml]', '');
    ret = ret.replace(/\[li\s+indent=\d+\s+align=\w+\]/gi, "[li]");
    return ret;
  }

  function insertLineBreaks(input_bbcode) {
    return input_bbcode.replace(/\n/g, "<br>");
  }

  // 1. Limpa, 2. Faz o parser
  const cleaned = cleanBBCode(input_bbcode);
  const withBr = insertLineBreaks(cleaned);
  const html = parse(withBr);

  return {
    html: html
  };
}