##Updated first time setup for SOSA 2019
For access to our tickets, you'll need to setup JIRA, follow their instructions!
Once you get it setup, you can find our backup in:
SOSA_SPRG_19_JIRA_DB.zip

Use Pycharm to clone the repository.

Ensure you are using the built in terminal (Ctrl+Shift+A -> *type* Terminal)

virtual enviornment- we're using venv to containerize our apps dependencies away from the rest of the system.
 You may notice a similarly named folder in the repo, but you may find that you have issues using it.
 In this case you'll first want to create a new env, to do so follow these instructions
    https://www.jetbrains.com/help/pycharm-edu/creating-virtual-environment.html
    
After you have your environment configured, and you restart pycharm. You should now notic your terminal should have your env's name (likeso) on your console line. This indicates that your env is active. You can also cd into your env folder and run the activate command 
to use that environment. 

Here are some more resources to help with virtual environments, as there is a chance you have not worked with them before:
    https://uoa-eresearch.github.io/eresearch-cookbook/recipe/2014/11/26/python-virtual-env/

Once it's open, you'll need to configure the dependencies
Use the command 'pip install x' to install the following

You can also copy all of those without a comma into a req.txt file and run 
pip install -r req.txt and it will install them all!

Next we need to configure settings.py location:
    In the next section we will be using a file from sosa_project module called settings.py, this is where our application config is located.
    (ADVANCED) Skip this section if using the built in terminal, PyCharm should recognize the VirtualEnv by default
    Some gotchas for this, if you're working outside the terminal in pycharm you'll find you won't be working in the virtualenv by default (venv)
        Thus, it won't be able to find the project module. 
            To resolve this go into your pyvenv.cfg (project_root/venv/pyvenv.cfg) then ensure your home variable is set to your python installation home
            Then you're going to want to cd into Scripts and type activate. This will put your command prompt into venv mode.
            From here, you should be able to continue normally. You always want to make sure you are using venv's python.exe. Otherwise you will have issues.
            

            
           

Set the DJANGO_SETTINGS_MODULE to sosa_project.settings:
   
   for windows run this command within the SAME terminal you are working in.
        ->set DJANGO_SETTINGS_MODULE=sosa_project.settings
   note: This is not perm and will apply only to the current terminal you are working in. You can set it yourself perm if you want.
   This is outside of the scope of this document.
   note: It may be a good idea to run django-admin check here to identify any issues, especially if you are not using PyCharm.
   


Setting up the DB
    Download Postgre from https://www.postgresql.org/download/windows/
    By default, the password should be password. Yes I KNOW this is bad. We'll change it later, on the SOSA PROD server.
    By default, the settings.py specifies the DB server as being on localhost on the default port 5432

    Once it finishes installing, create a new database called djangososa.

    After that, you should be G2G with the database.

After you have done this, the next step is to create migrations
By default the only two things we need to make migrations for are usermodels and pagemodels

    python manage.py makemigrations users
    python manage.py makemigrations pages

then run

python manage.py migrate

**If you get any issues here be sure to delete XXX_Migrations files in your migrations folder**
This should auto generate the files needed by Django to function.
If you don't do this, you will get relation "x" does not exist errors.
This is because Django is unable to resolve relationships between the model layer and the view layer.

You can confirm things are working by using django-admin runserver. 
You can also create a configuration in PyCharm to run. This will be the method we will primarily use




## First-time setup 

1.  Make sure Python 3.7x and Pipenv are already installed. [See here for help](https://djangoforbeginners.com/initial-setup/).
2.  Clone the repo and configure the virtualenv:

```
$ git clone https://github.com/GSU-CS-Software-Engineering/fall18-sosa.git
$ cd fall18-sosa
$ pipenv install
$ pipenv shell
```

[Okay, this is not in plain english, please see this to understand what migrations are. https://docs.djangoproject.com/en/2.1/topics/migrations/]
3.  Set up the initial migration for our custom user models in `users` and build the database.

```
(fall18-sosa) $ python manage.py makemigrations users
You also need to run this same command, but with 'pages' instead of 'users'
After this, you can kick off the migration process.
(fall18-sosa) $ python manage.py migrate
```

4.  Create a superuser:

```
(fall18-sosa) $ python manage.py createsuperuser
```

5.  Confirm everything is working:

```
(fall18-sosa) $ python manage.py runserver
```

Load the site at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Windows quick initial setup, you can do exactly this on mac but with homebrew

1. Setup Application Installer

    Open admind command prompt 
     powershell
    > Get-ExecutionPolicy // If this returns 'Restricted', enter command below
        $Set-ExecutionPolicy AllSigned
    > Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

    Exit powershell and return to regular admin command prompt and create a folder in your desired work location called 'django'
    Navigate to your django folder on the terminal

2. Installing dependencies //Skip or update any that you already have

    > choco install python --versioin=3.7.2
    > pip install pipenv

    > choco install git.install
    > git clone GITHUB_REPOSITORY_LINK
    
    > choco install postgresql //remember generated passowrd
    > psql postgres postgres 
    > \password postgres //change password here
    > CREATE DATABASE djangososa;
    > \q

    > pipenv shell //enter this environment whenever running python commands
    > python manage.py makemigrations users
    > python manage.py makemigrations pages
    > python manage.py migrate
    > python manage.py createsuperuser
    > python manage.py runserver 

    Go to 127.0.0.1:8000

3. Common errors

    Allauth error
        Make  sure you're actually in your virtual environment > pipenv shell
        Otherwise, > pip install django-allauth
    
    No module called '.......'
        > pip install django-cors-headers
        > pip install '.......'
    
    Email API error (sendgrid_backend)
        > pip install sendgrid-django-v5


<details>
 <summary>click to expand</summary>
 <details>
 <summary>click to expand</summary>
  <details>
 <summary>click to expand</summary>
   <details>
 <summary>click to expand</summary>
    <details>
 <summary>click to expand</summary>
     <details>
 <summary>click to expand</summary>
      <details>
 <summary>click to expand</summary>
       <details>
 <summary>click to expand</summary>
        <details>
 <summary>click to expand</summary>
         <details>
    <summary> click to expand </summary>
    I've mastered programming within hours. I wrote my OWN versions of the two most popular programs in the world.
 
     The first is Hello World. While rudimentary, and lacking in threading capabilities, it boasts an extremely user-friendly and intuitive interface. I wrote it in c++ using gcc compiler, Asus monitor, and human fingers.

     The second is Good Bye world. While it may not be as widely known as Hello World, it still offers the EXACT same amount of utility that the hello world program offers. I wrote this in Java using some coffee grounds I found at the bottom of my Starbucks cup. I compiled it myself with a straw.

     I too am thinking of expanding on my Hello World program and turning it into a multi-greeting, synchronized planetary operating system based off the not widely known Iinux kernel (which I also made by hand using binary found in the background of the Matrix (the first), specifically minutes 22 thru 34 as a base.) I've yet to compile my binary into assembly, and then compile the assembly into c++ so that I can finally recompile into an exe, but when I do... I'll be rich! I'm going to name the OS Look Out World, or LOW for short. So look out world, there will be a new LOW coming from me soon!!
</details>
</details>
</details>
</details>
</details>
</details>
</details>
</details>
</details>
</details>
