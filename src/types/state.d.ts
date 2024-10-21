export type AppState = {
  loading: boolean;
  newMotor?: { title: string };
  newWebsite?: {
    title: string;
    url: string;
    active: boolean;
  };
  motors: any[];
  websites: {
    title: string;
    url: string;
    active: boolean;
  }[];
};
