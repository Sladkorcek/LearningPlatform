from django.shortcuts import render, reverse, redirect
from django.forms import EmailField
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth import get_user_model

User = get_user_model()

# Modified from https://gist.github.com/schwuk/2725286
class UserCreationWithEmailForm(UserCreationForm):
    email = EmailField(label=_("Email address"), required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user

def register(request):

    form = UserCreationWithEmailForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(reverse('documents'))

    return render(request,'register.html', {
        'form': form
    })