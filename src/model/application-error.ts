class AppError {
  errors: string;

  constructor(errorString:string) {
    this.errors = errorString;
  }
}

export default AppError;