
const int greenLEDPin = 9;
const int redLEDPin = 11;
const int blueLEDPin = 10;

const int sensorPin = A0;

const int LOWER_BOUND = 400;
const int UPPER_BOUND = 1000;
const int MEDIUM_BOUND = 600;

int sensorValue = 0;

void setup() {
  Serial.begin(9600);

  pinMode(greenLEDPin, OUTPUT);
  pinMode(redLEDPin, OUTPUT);
  pinMode(blueLEDPin, OUTPUT);
  
}


int computeIntensityHardCap(const int inputValue) {
  return inputValue < MEDIUM_BOUND ? 20 : 0; 
}

int computeIntensity(const int inputValue) {
  if (inputValue < LOWER_BOUND) {
    return 255;
  } else if (inputValue >= UPPER_BOUND) {
    return 0;
  } else {
    return (255 - ((inputValue - LOWER_BOUND) * 255.0
        / (UPPER_BOUND - LOWER_BOUND))) / 2;
  }
}

int blinkColor = 0;

int filter(const int color) {
  return (blinkColor + 1) & color ? 1 : 0;  
}

void loop() {
  delay(100);
  sensorValue = analogRead(sensorPin);

  Serial.print("Raw Sensor value :");
  Serial.print(sensorValue);

  int displayValue = computeIntensityHardCap(sensorValue);
  Serial.print("\t-> ");
  Serial.print(displayValue);

  Serial.print("\n");

  analogWrite(greenLEDPin, displayValue * filter(1));
  analogWrite(redLEDPin  , displayValue * filter(2));
  analogWrite(blueLEDPin , displayValue * filter(4));

  blinkColor = (blinkColor + 1) % 7;
}
