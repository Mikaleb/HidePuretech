export type AppState = {
  newMotor?: { title: string };
  newWebsite?: {
    title: string;
    url: string;
    active: boolean;
  };
  isOn: boolean;
  motors: any[];
  websites: {
    title: string;
    url: string;
    active: boolean;
  }[];
};
