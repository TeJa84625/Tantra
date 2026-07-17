// Configuration constants
const int MAX_ANGLE = 360;
const int MAX_RANGE = 200;

int currentAngle = 0;
bool sweepingForward = true;
bool isRunning = false;       // Starts automatically as true
unsigned long currentDelay = 1000; // Default delay in milliseconds

void setup() {
  Serial.begin(9600);
  randomSeed(analogRead(0));
}

void loop() {
  // Process CMD incoming commands non-blockingly
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    input.trim();
    input.toLowerCase();

    if (input == "stop" || input == "q") {
      isRunning = false;
    } 
    else if (input.startsWith("start")) {
      isRunning = true;
      
      // Parse custom delay if provided via format: start-XXXX
      int dashIndex = input.indexOf('-');
      if (dashIndex != -1) {
        String delayStr = input.substring(dashIndex + 1);
        int parsedDelay = delayStr.toInt();
        if (parsedDelay > 0) {
          currentDelay = parsedDelay; // Set dynamic delay (e.g., 500)
        }
      } else {
        currentDelay = 1000; // Reset to default 1000ms if just "start" is typed
      }
    }
  }

  // Sweep loop execution
  if (isRunning) {
    int distance;

    // --- REAL WORLD OBJECT SIMULATION ENGINE ---
    // Simulate real environment reflections instead of blind noise
    if (currentAngle >= 40 && currentAngle <= 55) {
      // Object 1: Large structural pillar closer to the sensor
      distance = 45 + random(-2, 3); 
    } 
    else if (currentAngle >= 175 && currentAngle <= 190) {
      // Object 2: Human-sized target at medium distance
      distance = 80 + random(-3, 4); 
    } 
    else if (currentAngle >= 290 && currentAngle <= 310) {
      // Object 3: A wall passing on a slant
      // Map depth gradient dynamically relative to the sweep angle
      distance = 120 + (currentAngle - 290) * 2 + random(-1, 2);
    } 
    else {
      // Background reflection/Open space with minor atmospheric fluctuations
      distance = (MAX_RANGE - 15) + random(-5, 10);
      if (distance > MAX_RANGE) distance = MAX_RANGE; // Cap at physical sensor threshold
    }

    // Output matches your regex perfectly: /rador-(\d+):(\d+)\/(\d+)-(\d+)/i
    Serial.print("rador-");
    Serial.print(MAX_ANGLE);
    Serial.print(":");
    Serial.print(MAX_RANGE);
    Serial.print("/");
    Serial.print(currentAngle);
    Serial.print("-");
    Serial.println(distance);

    // Continuous sequential stepping (0,1,2,3...360...0)
    if (sweepingForward) {
      currentAngle++;
      if (currentAngle > MAX_ANGLE) {
        currentAngle = MAX_ANGLE - 1; 
        sweepingForward = false;      
      }
    } else {
      currentAngle--;
      if (currentAngle < 0) {
        currentAngle = 1;             
        sweepingForward = true;       
      }
    }

    delay(currentDelay); 
  }
}