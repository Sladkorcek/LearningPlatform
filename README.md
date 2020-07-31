# LearningPlatform
Extended markdown editor and sharing platform.

## Installation
To install and run this project, first clone the repository and enter the `LearningPlatform` directory.

### Clone the repository
```
git clone https://github.com/Sladkorcek/LearningPlatform.git
cd LearningPlatform
```

### Linux
After the repository has been cloned, create a new virtual environment, activate it, install project requirements and migrate the database.

```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
```

### Windows
On Windows, the steps are very similar. First, clone the repository as [above](#clone-the-repository).

Then create a new virtual environment, activate it, install requirements and migrate the database.

```
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```

## Running
To start a development server, run the following command.

```bash
python manage.py runserver
```

The development server can be accessed at [http://localhost:8000](http://localhost:8000).