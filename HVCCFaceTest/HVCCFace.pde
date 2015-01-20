HVCCFace getHVCCFace(String url, int idx) {
  JSONObject json = loadJSONObject(url);
  if (json == null) return null;

  JSONArray faces = json.getJSONArray("face");
  if (idx < 0 || faces.size() <= idx) return null;
  
  JSONObject face = faces.getJSONObject(idx);
  return new HVCCFace(face);
}

class HVCCFace {
  int x;
  int y;
  int size;
  int confidence;
  
  int dir_yaw;
  int dir_pitch;
  int dir_roll;
  int dir_confidence;
  
  int age_age;
  int age_confidence;
  
  String gen_gender;
  int gen_confidence;
  
  int gaze_gazeLR;
  int gaze_gazeUD;

  int blink_ratioL;
  int blink_ratioR;

  String exp_expression;  
  int exp_score;
  int exp_degree;

  HVCCFace(JSONObject obj) {
    x = obj.getInt("x");
    y = obj.getInt("y");
    size = obj.getInt("size");
    confidence = obj.getInt("confidence");
    
    JSONObject dir = obj.getJSONObject("dir");
    if (dir != null) {
      dir_yaw = dir.getInt("yaw");
      dir_pitch = dir.getInt("pitch");
      dir_roll = dir.getInt("roll");
      dir_confidence = dir.getInt("confidence");
    }
    
    JSONObject age = obj.getJSONObject("age");
    if (age != null) {
      age_age = age.getInt("age");
      age_confidence = age.getInt("confidence");
    }
    
    JSONObject gen = obj.getJSONObject("gen");
    if (gen != null) {
      gen_gender = gen.getString("gender");
      gen_confidence = gen.getInt("confidence");
    }
    
    JSONObject gaze = obj.getJSONObject("gaze");
    if (gaze != null) {
      gaze_gazeLR = gaze.getInt("gazeLR");
      gaze_gazeUD = gaze.getInt("gazeUD");
    }
    
    JSONObject blink = obj.getJSONObject("blink");
    if (blink != null) {
      blink_ratioL = blink.getInt("ratioL");
      blink_ratioR = blink.getInt("ratioR");
    }

    JSONObject exp = obj.getJSONObject("exp");
    if (exp != null) {
      exp_expression = exp.getString("expression");  
      exp_score = exp.getInt("score");
      exp_degree = exp.getInt("degree");
    }
  }
  
  String toString() {
    String s = "";
    
    s += "{";
    s += "x:" + x + ",";
    s += "y:" + y + ",";
    s += "size:" + size + ",";
    s += "conficence:" + confidence + ",";
    
    s += "dir:{";
    s += "yaw:" + dir_yaw + ",";
    s += "pitch:" + dir_pitch + ",";
    s += "roll:" + dir_roll + ",";
    s += "confidence:" + dir_confidence;
    s += "},";
    
    s += "age:{";
    s += "age:" + age_age + ",";
    s += "confidence:" + age_confidence;
    s += "},";
    
    s += "gen:{";
    s += "gender:" + gen_gender + ",";
    s += "confidence:" + gen_confidence;
    s += "},";
    
    s += "gaze:{";
    s += "gazeLR:" + gaze_gazeLR + ",";
    s += "gazeUD:" + gaze_gazeUD;
    s += "},";
  
    s += "blink:{";
    s += "ratioL:" + blink_ratioL + ",";
    s += "ratioR:" + blink_ratioR;
    s += "},";
  
    s += "exp:{";
    s += "expression:" + exp_expression + ",";  
    s += "score:" + exp_score + ",";
    s += "degree:" + exp_degree;
    s += "}";

    s += "}";
    
    return s;
  }
}
