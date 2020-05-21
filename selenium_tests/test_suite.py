from selenium import webdriver
from pages.models import *
from users.models import *
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.urls import reverse
import time

#WARNING these tests are specific to my SOSA account, change the experiment names/etc to whatever login you use 

class initTest(StaticLiveServerTestCase):
    def setUp(self):
        self.selenium = webdriver.Chrome('selenium_tests/chromedriver.exe') #This driver is for windows, download and swap to appropriate OS @ chromedriver.chromium.org
        self.selenium.maximize_window()
        time.sleep(2)

    def tearDown(self):
        self.selenium.close()

    def test1Init(self):
        selenium = self.selenium
        selenium.get('http://warm-brook-87043.herokuapp.com')

        alert = self.selenium.find_element_by_class_name('container')
        self.assertEquals(
            alert.find_element_by_tag_name('h2').text, 'Welcome to SOSA!'
        )

    #Stage experiment
    def test5StageExperiment(self):
        selenium = self.selenium
        selenium.get('http://warm-brook-87043.herokuapp.com')

        user = self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/form/div[1]/div/input')
        user.send_keys("jn02788@georgiasouthern.edu") #use your own login credentials

        password = self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/form/div[2]/div/input')
        password.send_keys("Fransgel14") #use your own password

        self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/form/button').click()

        time.sleep(1)

        self.selenium.find_element_by_xpath('/html/body/div/div/span/a[2]').click()
        time.sleep(2)

        self.selenium.find_element_by_xpath('/html/body/div/div/span/div[1]/div/ul/li[3]').click()

        alert = selenium.switch_to.alert
        alert.accept()
        time.sleep(2)

        self.selenium.find_element_by_xpath('/html/body/div/div/span/a[2]').click()

        time.sleep(1)

        self.selenium.find_element_by_xpath('/html/body/div/div/span/div[3]/div[3]/a[2]').click()

        time.sleep(1)

        self.selenium.find_element_by_xpath('/html/body/div/div/span/div[5]/div/ul/div/li').click()

        time.sleep(2)

        self.selenium.find_element_by_xpath('/html/body/div/div/span/div[4]/a[2]').click()

        time.sleep(1)

        alert = selenium.switch_to.alert
        alert.accept()
        time.sleep(1)
        alert.accept()

        time.sleep(2)

        email = self.selenium.find_element_by_xpath('/html/body/div/div/center/label/textarea')
        email.send_keys("jn02788@georgiasouthern.edu")
        time.sleep(3)

        self.selenium.find_element_by_xpath('/html/body/div/div/center/div/button[2]').click()
        time.sleep(1)

        alert = selenium.switch_to.alert
        alert.accept()

        time.sleep(2)

    #Take experiment
    def test6TakeExperiment(self):
        selenium = self.selenium
        selenium.get('https://warm-brook-87043.herokuapp.com/subject/prompt/inv-a54dae6d-877a-4965-836a-e22cf2e096b5')

        time.sleep(2)

        name = self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/input[1]')
        name.send_keys("Selenium")

        experiment = self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/input[2]')
        experiment.send_keys("Sample Experiment")

        self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/button').click()

        time.sleep(2)

        self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/button[1]').click()

        time.sleep(2)

        self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/button[2]').click()
        
        time.sleep(2)

        self.selenium.find_element_by_xpath('/html/body/div/div[1]/span/div[2]/div/ul/li[1]').click()

        time.sleep(2)

    #Export Results
    def test7ExportResults(self):
        selenium = self.selenium
        selenium.get('http://warm-brook-87043.herokuapp.com')

        user = self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/form/div[1]/div/input')
        user.send_keys("jn02788@georgiasouthern.edu") #use your own login credentials

        password = self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/form/div[2]/div/input')
        password.send_keys("Fransgel14") #use your own password

        self.selenium.find_element_by_xpath('/html/body/div/div/div[1]/form/button').click()

        time.sleep(1)

        name = self.selenium.find_element_by_xpath('/html/body/div/div/span/input[1]')
        name.send_keys("Jeffrey")
        time.sleep(1)

        exp = self.selenium.find_element_by_xpath('/html/body/div/div/span/input[2]')
        exp.send_keys("Sample Experiment")
        time.sleep(2)

        self.selenium.find_element_by_xpath('/html/body/div/div/span/a[3]').click()
        time.sleep(5)
