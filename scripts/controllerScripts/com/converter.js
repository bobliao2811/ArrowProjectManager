function is_array(input) {
  return typeof(input) === "object" && (input instanceof Array);
}

function convert_formated_hex_to_bytes(hex_str) {
  var count = 0,
      hex_arr,
      hex_data = [],
      hex_len,
      i;
  
  if (hex_str.trim() == "") return [];
  
  /// Check for invalid hex characters.
  if (/[^0-9a-fA-F\s]/.test(hex_str)) {
    return false;
  }
  
  var a = hex_str.split('');
  var b = '';
  for(var i=0;i<a.length;i++){
  	b+=a[i];
  	if( (i+1) % 2 === 0) {
      b += " ";
    }
  }

  hex_str = b;
  

  hex_arr = hex_str.split(/([0-9a-fA-F]+)/g);
  hex_len = hex_arr.length;
  
  for (i = 0; i < hex_len; ++i) {
    if (hex_arr[i].trim() == "") {
      continue;
    }
    hex_data[count++] = parseInt(hex_arr[i], 16);
  }
  
  return hex_data;
}
function convert_formated_hex_to_string(s) {
  var byte_arr = convert_formated_hex_to_bytes(s);
  var res = "";
  for (var i = 0 ; i<byte_arr.length ; i+=2) {
    res += String.fromCharCode(byte_arr[i] | (byte_arr[i+1]<<8));
  }
  return res;
}
function convert_string_to_hex(s) {
  var byte_arr = [];
  for (var i = 0 ; i<s.length ; i++) {
    var value = s.charCodeAt(i);
    byte_arr.push(value & 255);
    byte_arr.push((value>>8) & 255);
  }
  return convert_to_formated_hex(byte_arr);
}

function convert_to_formated_hex(byte_arr) {
  var hex_str = "",
      i,
      len,
      tmp_hex;
  
  if (!is_array(byte_arr)) {
    return false;
  }
  
  len = byte_arr.length;
  
  for (i = 0; i < len; ++i) {
    if (byte_arr[i] < 0) {
      byte_arr[i] = byte_arr[i] + 256;
    }
    if (byte_arr[i] === undefined) {
      alert("Boom " + i);
      byte_arr[i] = 0;
    }
    tmp_hex = byte_arr[i].toString(16);
    
    // Add leading zero.
    if (tmp_hex.length == 1) tmp_hex = "0" + tmp_hex;
    
    hex_str += tmp_hex;
  }
  
  return hex_str.trim();
}

var base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
function binary_to_base64(input) {
  var ret = new Array();
  var i = 0;
  var j = 0;
  var char_array_3 = new Array(3);
  var char_array_4 = new Array(4);
  var in_len = input.length;
  var pos = 0;

  while (in_len--)
  {
      char_array_3[i++] = input[pos++];
      if (i == 3)
      {
          char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
          char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
          char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
          char_array_4[3] = char_array_3[2] & 0x3f;

          for (i = 0; (i <4) ; i++)
              ret += base64_chars.charAt(char_array_4[i]);
          i = 0;
      }
  }

  if (i)
  {
      for (j = i; j < 3; j++)
          char_array_3[j] = 0;

      char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
      char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
      char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
      char_array_4[3] = char_array_3[2] & 0x3f;

      for (j = 0; (j < i + 1); j++)
          ret += base64_chars.charAt(char_array_4[j]);

      while ((i++ < 3))
          ret += '=';

  }

  return ret;
}

function convert_hex_to_base64(hex) {
  var cleaned_hex = hex
  var binary = new Array();
  for (var i=0; i<cleaned_hex.length/2; i++) {
    var h = cleaned_hex.substr(i*2, 2);
    binary[i] = parseInt(h,16);        
  }
  return binary_to_base64(binary);
} 


module.exports = {
  is_array:is_array,
  convert_formated_hex_to_bytes:convert_formated_hex_to_bytes,
  convert_formated_hex_to_string:convert_formated_hex_to_string,
  convert_string_to_hex:convert_string_to_hex,
  convert_to_formated_hex:convert_to_formated_hex,
  binary_to_base64:binary_to_base64,
  convert_hex_to_base64:convert_hex_to_base64
};