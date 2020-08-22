from django.shortcuts import render, reverse, redirect
from django.forms import EmailField
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth import get_user_model

from django.http import JsonResponse

User = get_user_model()

# Modified from https://gist.github.com/schwuk/2725286
class UserCreationWithEmailForm(UserCreationForm):
    email = EmailField(label=_("Email address"), required=True)
    class Meta:
        model = User
        fields = UserCreationForm.Meta.fields + ("email",)

def register(request):

    form = UserCreationWithEmailForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            user = form.save()
            login(request, user)

            # After the user creates an account, set the 'tutorial' variable in
            # SESSION to True, so that we can display tutorial on other pages
            request.session['tutorial'] = True

            return redirect(reverse('documents'))

    return render(request,'register.html', {
        'form': form
    })

def begin_tutorial(request):
    # Set the 'tutorial' variable in SESSION to True so that the tutorial
    # displays the next time the user visit their profile page
    request.session['tutorial'] = True
    return JsonResponse({ 'tutorial': True })

def end_tutorial(request):
    # Set the 'tutorial' variable in SESSION to False so that the tutorial in
    # not displayed anymore
    request.session['tutorial'] = False
    return JsonResponse({ 'tutorial': False })